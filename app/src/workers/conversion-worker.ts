/**
 * RenderForge Conversion Worker
 *
 * Runs as a separate process, picks up jobs from the BullMQ queue,
 * calls the configured AI provider, and stores the resulting 3D model.
 *
 * Usage: npx tsx src/workers/conversion-worker.ts
 */

import { Job } from 'bullmq';
import { createConversionWorker, type ConversionJobData } from '../lib/queue';
import { getAIProvider } from '../lib/ai';
import { uploadBuffer, getStorageKey, getPublicUrl, getDownloadUrl } from '../lib/storage';
import { db } from '../lib/db';

console.log('[Worker] RenderForge conversion worker starting...');

const worker = createConversionWorker(async (job: Job<ConversionJobData>) => {
    const { jobId, userId, imageUrl, quality, format, textured, aiProvider: providerName } = job.data;

    console.log(`[Worker] Processing job ${jobId} | provider=${providerName} quality=${quality} format=${format}`);

    try {
        // Update status to PROCESSING
        await db.conversionJob.update({
            where: { id: jobId },
            data: { status: 'PROCESSING', progress: 0 }
        });

        // Resolve the actual image URL from S3 key
        let resolvedImageUrl = imageUrl;
        if (imageUrl.startsWith('s3://')) {
            const key = imageUrl.replace('s3://', '');
            resolvedImageUrl = await getDownloadUrl(key);
        }

        // Get the AI provider
        const provider = getAIProvider(providerName);

        // Run the conversion with progress updates
        const result = await provider.convert(
            {
                imageUrl: resolvedImageUrl,
                quality: quality as 'draft' | 'standard' | 'high',
                format: format as 'glb' | 'gltf' | 'obj' | 'fbx',
                textured
            },
            async (progress: number) => {
                await db.conversionJob.update({
                    where: { id: jobId },
                    data: { progress: Math.min(progress, 95) }
                });
            }
        );

        console.log(`[Worker] AI conversion complete for job ${jobId}`);

        // Download the model from the AI provider's URL and re-upload to our S3
        let modelUrl = result.modelUrl;
        let thumbnailUrl = result.thumbnailUrl;

        if (modelUrl) {
            const modelResponse = await fetch(modelUrl);
            const modelBuffer = Buffer.from(await modelResponse.arrayBuffer());

            const modelKey = getStorageKey(userId, 'model', `model.${format}`);
            modelUrl = await uploadBuffer(
                modelKey,
                modelBuffer,
                format === 'glb' ? 'model/gltf-binary' : 'application/octet-stream'
            );

            // Update file size from actual downloaded data
            result.fileSizeBytes = modelBuffer.length;
        }

        if (result.thumbnailUrl) {
            const thumbResponse = await fetch(result.thumbnailUrl);
            const thumbBuffer = Buffer.from(await thumbResponse.arrayBuffer());
            const thumbKey = getStorageKey(userId, 'thumbnail', 'thumb.png');
            thumbnailUrl = await uploadBuffer(thumbKey, thumbBuffer, 'image/png');
        }

        // Create the Model3D record
        const model = await db.model3D.create({
            data: {
                userId,
                name: `3D Model — ${new Date().toLocaleDateString()}`,
                modelUrl: modelUrl,
                thumbnailUrl: thumbnailUrl || null,
                originalImageUrl: imageUrl,
                format,
                fileSizeBytes: result.fileSizeBytes || 0,
                vertexCount: result.vertexCount || null,
                faceCount: result.faceCount || null,
                textured,
                jobId
            }
        });

        // Mark job as completed
        await db.conversionJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                progress: 100,
                modelId: model.id
            }
        });

        console.log(`[Worker] Job ${jobId} completed. Model ID: ${model.id}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Worker] Job ${jobId} failed:`, errorMessage);

        await db.conversionJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorMessage
            }
        });

        throw error; // Let BullMQ handle retries
    }
});

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} finished successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});

worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[Worker] Shutting down...');
    await worker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[Worker] Shutting down...');
    await worker.close();
    process.exit(0);
});

console.log('[Worker] Ready and waiting for jobs...');
