import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

// ─── Conversion Queue ───────────────────────────────────────

export const conversionQueue = new Queue('3d-conversion', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 }
    }
});

export interface ConversionJobData {
    jobId: string;
    userId: string;
    imageUrl: string;
    quality: string;
    format: string;
    textured: boolean;
    aiProvider: string;
}

export function createConversionWorker(
    processor: (job: Job<ConversionJobData>) => Promise<void>
) {
    return new Worker<ConversionJobData>('3d-conversion', processor, {
        connection,
        concurrency: 5
    });
}
