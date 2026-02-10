import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/storage';
import crypto from 'crypto';

// GET /api/models/:id — Get a 3D model
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    // Allow public access via share token
    const model = await db.model3D.findUnique({
        where: { id: params.id }
    });

    if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Check access: owner or public
    if (!model.isPublic && model.userId !== session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(model);
}

// PATCH /api/models/:id — Update model (rename, toggle public, etc.)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const model = await db.model3D.findFirst({
        where: { id: params.id, userId: session.user.id }
    });

    if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.isPublic !== undefined) {
        updates.isPublic = body.isPublic;
        // Generate share token when making public
        if (body.isPublic && !model.shareToken) {
            updates.shareToken = crypto.randomBytes(16).toString('hex');
        }
    }

    const updated = await db.model3D.update({
        where: { id: params.id },
        data: updates
    });

    return NextResponse.json(updated);
}

// DELETE /api/models/:id — Delete a 3D model
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const model = await db.model3D.findFirst({
        where: { id: params.id, userId: session.user.id }
    });

    if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Delete files from S3
    try {
        const modelKey = new URL(model.modelUrl).pathname.slice(1);
        await deleteFile(modelKey);
        if (model.thumbnailUrl) {
            const thumbKey = new URL(model.thumbnailUrl).pathname.slice(1);
            await deleteFile(thumbKey);
        }
    } catch {
        // Continue with DB deletion even if S3 cleanup fails
    }

    await db.model3D.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
}
