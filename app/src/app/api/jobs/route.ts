import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/jobs — List user's conversion jobs
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const where: Record<string, unknown> = { userId: session.user.id };
    if (status) {
        where.status = status.toUpperCase();
    }

    const [jobs, total] = await Promise.all([
        db.conversionJob.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                model: {
                    select: {
                        id: true,
                        name: true,
                        thumbnailUrl: true,
                        modelUrl: true,
                        format: true
                    }
                }
            }
        }),
        db.conversionJob.count({ where })
    ]);

    return NextResponse.json({ jobs, total, limit, offset });
}
