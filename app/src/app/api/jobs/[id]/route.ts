import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/jobs/:id — Get a specific job's status
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await db.conversionJob.findFirst({
        where: {
            id: params.id,
            userId: session.user.id
        },
        include: {
            model: true
        }
    });

    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        quality: job.quality,
        format: job.format,
        aiProvider: job.aiProvider,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        model: job.model ? {
            id: job.model.id,
            name: job.model.name,
            modelUrl: job.model.modelUrl,
            thumbnailUrl: job.model.thumbnailUrl,
            format: job.model.format,
            fileSizeBytes: job.model.fileSizeBytes,
            vertexCount: job.model.vertexCount,
            faceCount: job.model.faceCount
        } : null
    });
}
