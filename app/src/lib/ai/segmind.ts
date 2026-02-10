import { AIProvider } from './base';
import type { AIConversionInput, AIConversionResult, AIProviderStatus } from '@/types';

/**
 * Segmind provider — Hunyuan3D-2mv (multiview image-to-3D).
 *
 * Key advantage: SYNCHRONOUS API — no polling needed.
 * Supports multi-view input (front/back/left/right) for higher accuracy.
 * Returns raw binary GLB data directly in the response.
 *
 * Cost: ~$0.32 per generation.
 * https://www.segmind.com/models/hunyuan3d-2mv
 */
export class SegmindHunyuan3DProvider extends AIProvider {
    readonly name = 'segmind-hunyuan3d';
    readonly supportedFormats = ['glb'];
    readonly supportedQualities = ['draft', 'standard', 'high'];

    private apiKey: string;
    private endpoint = 'https://api.segmind.com/v1/hunyuan3d-2mv';

    constructor(apiKey?: string) {
        super();
        this.apiKey = apiKey || process.env.SEGMIND_API_KEY || '';
    }

    /**
     * Segmind is synchronous — startConversion returns a synthetic task ID.
     * The actual work happens in convert().
     */
    async startConversion(input: AIConversionInput): Promise<string> {
        // Store input as a task reference — actual conversion happens in convert()
        const taskId = `segmind:${Date.now()}:${JSON.stringify({
            imageUrl: input.imageUrl,
            quality: input.quality
        })}`;
        return taskId;
    }

    async getStatus(taskId: string): Promise<AIProviderStatus> {
        // Segmind is synchronous, so if we're polling it means convert() is running
        return {
            taskId,
            status: 'processing',
            progress: 50
        };
    }

    async cancelConversion(_taskId: string): Promise<void> {
        // Synchronous API — can't cancel mid-request
    }

    /**
     * Override convert() for synchronous Segmind API.
     * Sends request → receives binary GLB directly in response body.
     */
    async convert(
        input: AIConversionInput,
        onProgress?: (progress: number) => void
    ): Promise<AIConversionResult> {
        if (onProgress) onProgress(5);

        const body = this.buildRequestBody(input);

        if (onProgress) onProgress(10);

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (onProgress) onProgress(60);

        if (!response.ok) {
            const statusMessages: Record<number, string> = {
                400: 'Invalid parameters',
                401: 'Invalid API key',
                406: 'Insufficient credits — top up at segmind.com',
                429: 'Rate limit exceeded — try again in a moment',
                500: 'Segmind server error'
            };
            const message = statusMessages[response.status] || `HTTP ${response.status}`;
            throw new Error(`Segmind Hunyuan3D error: ${message}`);
        }

        // Response is raw binary GLB data
        const buffer = await response.arrayBuffer();
        const modelBuffer = Buffer.from(buffer);

        if (onProgress) onProgress(90);

        // We need to upload this buffer to S3 — return a data URL temporarily
        // The worker will handle the actual S3 upload
        const base64 = modelBuffer.toString('base64');
        const dataUrl = `data:model/gltf-binary;base64,${base64}`;

        if (onProgress) onProgress(100);

        return {
            modelUrl: dataUrl,
            fileSizeBytes: modelBuffer.length
        };
    }

    private buildRequestBody(input: AIConversionInput): Record<string, unknown> {
        const qualityConfig = this.getQualityConfig(input.quality);

        return {
            front_image: input.imageUrl,
            seed: -1,
            randomize_seed: true,
            steps: qualityConfig.steps,
            guidance_scale: 5,
            file_type: 'glb',
            target_face_num: qualityConfig.faceCount,
            octree_resolution: qualityConfig.octreeResolution,
            num_chunks: qualityConfig.numChunks,
            remove_background: true
        };
    }

    private getQualityConfig(quality: string) {
        switch (quality) {
        case 'draft':
            return {
                steps: 15,
                faceCount: 5000,
                octreeResolution: 128,
                numChunks: 100000
            };
        case 'high':
            return {
                steps: 50,
                faceCount: 50000,
                octreeResolution: 512,
                numChunks: 500000
            };
        case 'standard':
        default:
            return {
                steps: 30,
                faceCount: 10000,
                octreeResolution: 256,
                numChunks: 200000
            };
        }
    }
}
