import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { conversionQueue } from '@/lib/queue';
import { getUploadUrl, getStorageKey } from '@/lib/storage';
import { PLANS } from '@/types';
import type { Plan } from '@prisma/client';

const convertSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.enum(['raster', 'vector', 'drawing']),
    contentType: z.string().min(1),
    quality: z.enum(['draft', 'standard', 'high']).default('standard'),
    format: z.enum(['glb', 'gltf', 'obj', 'fbx']).default('glb'),
    textured: z.boolean().default(true),
    aiProvider: z.string().optional()
});

// POST /api/convert — Start a new 2D-to-3D conversion
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = convertSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { fileName, fileType, contentType, quality, format, textured, aiProvider } = parsed.data;

    // Get user with plan info
    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check plan limits
    const planConfig = PLANS[user.plan as Plan];

    // Reset monthly counter if needed
    const now = new Date();
    if (now > user.monthlyConversionReset) {
        const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        await db.user.update({
            where: { id: user.id },
            data: { monthlyConversions: 0, monthlyConversionReset: nextReset }
        });
        user.monthlyConversions = 0;
    }

    if (user.monthlyConversions >= planConfig.monthlyConversions) {
        return NextResponse.json(
            { error: 'Monthly conversion limit reached. Please upgrade your plan.' },
            { status: 429 }
        );
    }

    if (!planConfig.qualities.includes(quality)) {
        return NextResponse.json(
            { error: `Quality "${quality}" not available on your plan.` },
            { status: 403 }
        );
    }

    if (!planConfig.formats.includes(format)) {
        return NextResponse.json(
            { error: `Format "${format}" not available on your plan.` },
            { status: 403 }
        );
    }

    // Generate presigned upload URL
    const storageKey = getStorageKey(user.id, 'input', fileName);
    const uploadUrl = await getUploadUrl(storageKey, contentType);
    const imageUrl = `s3://${storageKey}`;

    // Create job record
    const job = await db.conversionJob.create({
        data: {
            userId: user.id,
            inputImageUrl: imageUrl,
            inputFileName: fileName,
            inputFileType: fileType,
            quality,
            format,
            textured,
            aiProvider: aiProvider || process.env.AI_PROVIDER || 'meshy'
        }
    });

    // Increment usage
    await db.user.update({
        where: { id: user.id },
        data: { monthlyConversions: { increment: 1 } }
    });

    // Queue the conversion job
    await conversionQueue.add('convert', {
        jobId: job.id,
        userId: user.id,
        imageUrl,
        quality,
        format,
        textured,
        aiProvider: aiProvider || process.env.AI_PROVIDER || 'meshy'
    });

    return NextResponse.json({
        jobId: job.id,
        uploadUrl,
        storageKey,
        status: 'PENDING'
    });
}
