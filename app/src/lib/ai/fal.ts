import { AIProvider } from './base';
import type { AIConversionInput, AIConversionResult, AIProviderStatus } from '@/types';

/**
 * fal.ai — unified 3D generation provider.
 *
 * fal.ai hosts multiple 3D generation models behind a single API key:
 *   - fal-ai/triposr           — Fast single-image 3D reconstruction
 *   - fal-ai/meshy/v6/image-to-3d — Production-ready textured 3D from images
 *   - fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d — Text-to-3D generation
 *
 * All endpoints use the same auth pattern: `Authorization: Key $FAL_KEY`
 * All jobs are async: submit → poll queue → get result.
 *
 * https://fal.ai/models
 */

type FalModel = 'triposr' | 'meshy-v6' | 'hunyuan-3d';

const FAL_MODELS: Record<FalModel, {
    endpoint: string;
    name: string;
    supportsTextures: boolean;
    supportsPBR: boolean;
    outputFormats: string[];
}> = {
    'triposr': {
        endpoint: 'https://fal.run/fal-ai/triposr',
        name: 'TripoSR (Fast)',
        supportsTextures: false,
        supportsPBR: false,
        outputFormats: ['glb', 'obj']
    },
    'meshy-v6': {
        endpoint: 'https://fal.run/fal-ai/meshy/v6/image-to-3d',
        name: 'Meshy v6 (Production)',
        supportsTextures: true,
        supportsPBR: true,
        outputFormats: ['glb', 'obj', 'fbx', 'usdz']
    },
    'hunyuan-3d': {
        endpoint: 'https://fal.run/fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d',
        name: 'Hunyuan 3D (Text-to-3D)',
        supportsTextures: true,
        supportsPBR: true,
        outputFormats: ['obj']
    }
};

export class FalAIProvider extends AIProvider {
    readonly name = 'fal';
    readonly supportedFormats = ['glb', 'gltf', 'obj', 'fbx'];
    readonly supportedQualities = ['draft', 'standard', 'high'];

    private apiKey: string;
    private model: FalModel;
    private queueBaseUrl = 'https://queue.fal.run';

    constructor(apiKey?: string, model?: FalModel) {
        super();
        this.apiKey = apiKey || process.env.FAL_KEY || '';
        this.model = model || (process.env.FAL_MODEL as FalModel) || 'meshy-v6';
    }

    async startConversion(input: AIConversionInput): Promise<string> {
        const modelConfig = FAL_MODELS[this.model];
        if (!modelConfig) {
            throw new Error(`Unknown fal.ai model: ${this.model}. Available: ${Object.keys(FAL_MODELS).join(', ')}`);
        }

        const body = this.buildRequestBody(input);

        // Submit to fal.ai queue
        const queueEndpoint = modelConfig.endpoint.replace('https://fal.run', this.queueBaseUrl);

        const response = await fetch(queueEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`fal.ai error (${this.model}): ${response.status} - ${error}`);
        }

        const data = await response.json();
        const requestId = data.request_id;

        if (!requestId) {
            // Synchronous response — model returned result directly
            return `fal:sync:${this.model}:${JSON.stringify(data)}`;
        }

        return `fal:${this.model}:${requestId}`;
    }

    async getStatus(taskId: string): Promise<AIProviderStatus> {
        const parts = taskId.split(':');
        if (parts[0] !== 'fal') {
            throw new Error(`Invalid fal.ai task ID: ${taskId}`);
        }

        // Handle synchronous results
        if (parts[1] === 'sync') {
            const modelName = parts[2] as FalModel;
            const data = JSON.parse(parts.slice(3).join(':'));
            return {
                taskId,
                status: 'completed',
                progress: 100,
                result: this.parseResult(data, modelName)
            };
        }

        const modelName = parts[1] as FalModel;
        const requestId = parts.slice(2).join(':');
        const modelConfig = FAL_MODELS[modelName];

        // Extract the fal model path for status URL
        const modelPath = modelConfig.endpoint.replace('https://fal.run/', '');
        const statusUrl = `${this.queueBaseUrl}/${modelPath}/requests/${requestId}/status`;

        const response = await fetch(statusUrl, {
            headers: {
                'Authorization': `Key ${this.apiKey}`
            }
        });

        if (!response.ok) {
            return {
                taskId,
                status: 'processing',
                progress: 50
            };
        }

        const data = await response.json();

        if (data.status === 'COMPLETED') {
            // Fetch the actual result
            const resultUrl = `${this.queueBaseUrl}/${modelPath}/requests/${requestId}`;
            const resultResponse = await fetch(resultUrl, {
                headers: {
                    'Authorization': `Key ${this.apiKey}`
                }
            });

            if (resultResponse.ok) {
                const resultData = await resultResponse.json();
                return {
                    taskId,
                    status: 'completed',
                    progress: 100,
                    result: this.parseResult(resultData, modelName)
                };
            }
        }

        if (data.status === 'FAILED') {
            return {
                taskId,
                status: 'failed',
                progress: 0,
                error: data.error || 'Conversion failed on fal.ai'
            };
        }

        // IN_QUEUE or IN_PROGRESS
        return {
            taskId,
            status: data.status === 'IN_QUEUE' ? 'pending' : 'processing',
            progress: data.status === 'IN_QUEUE' ? 10 : 60
        };
    }

    async cancelConversion(taskId: string): Promise<void> {
        const parts = taskId.split(':');
        if (parts[0] !== 'fal' || parts[1] === 'sync') return;

        const modelName = parts[1] as FalModel;
        const requestId = parts.slice(2).join(':');
        const modelConfig = FAL_MODELS[modelName];
        const modelPath = modelConfig.endpoint.replace('https://fal.run/', '');

        await fetch(`${this.queueBaseUrl}/${modelPath}/requests/${requestId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Key ${this.apiKey}`
            }
        }).catch(() => {});
    }

    /**
     * Override convert() for synchronous fal.run endpoint (non-queued).
     * Falls back to queue-based polling for long-running models.
     */
    async convert(
        input: AIConversionInput,
        onProgress?: (progress: number) => void
    ): Promise<AIConversionResult> {
        const modelConfig = FAL_MODELS[this.model];
        const body = this.buildRequestBody(input);

        if (onProgress) onProgress(5);

        // Try synchronous endpoint first (works for fast models like TripoSR)
        const response = await fetch(modelConfig.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (onProgress) onProgress(20);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`fal.ai error (${this.model}): ${response.status} - ${error}`);
        }

        const data = await response.json();

        // If we got a request_id, switch to polling
        if (data.request_id) {
            const taskId = `fal:${this.model}:${data.request_id}`;
            if (onProgress) onProgress(30);

            while (true) {
                const status = await this.getStatus(taskId);
                if (onProgress) onProgress(Math.max(30, status.progress));

                if (status.status === 'completed' && status.result) {
                    return status.result;
                }
                if (status.status === 'failed') {
                    throw new Error(status.error || 'Conversion failed');
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // Synchronous result
        if (onProgress) onProgress(100);
        return this.parseResult(data, this.model);
    }

    private buildRequestBody(input: AIConversionInput): Record<string, unknown> {
        switch (this.model) {
        case 'triposr':
            return {
                image_url: input.imageUrl,
                output_format: input.format === 'obj' ? 'obj' : 'glb',
                do_remove_background: true,
                foreground_ratio: 0.9,
                mc_resolution: this.getMcResolution(input.quality)
            };

        case 'meshy-v6':
            return {
                image_url: input.imageUrl,
                topology: 'triangle',
                target_polycount: this.getPolyCount(input.quality),
                should_remesh: true,
                should_texture: input.textured,
                enable_pbr: input.textured && input.quality !== 'draft',
                symmetry_mode: 'auto',
                enable_safety_checker: true
            };

        case 'hunyuan-3d':
            return {
                prompt: `3D model from reference image: ${input.imageUrl}`,
                enable_pbr: input.textured,
                enable_geometry: !input.textured
            };

        default:
            return { image_url: input.imageUrl };
        }
    }

    private parseResult(data: any, model: FalModel): AIConversionResult {
        switch (model) {
        case 'triposr':
            return {
                modelUrl: data.model_mesh?.url || '',
                fileSizeBytes: data.model_mesh?.file_size || 0
            };

        case 'meshy-v6':
            return {
                modelUrl: data.model_glb?.url || data.model_urls?.glb?.url || '',
                thumbnailUrl: data.thumbnail?.url,
                fileSizeBytes: data.model_glb?.file_size || 0
            };

        case 'hunyuan-3d':
            return {
                modelUrl: data.model_obj?.url || data.model_urls?.obj?.url || '',
                thumbnailUrl: data.thumbnail?.url,
                fileSizeBytes: data.model_obj?.file_size || 0
            };

        default:
            return {
                modelUrl: data.model_mesh?.url || data.model_glb?.url || '',
                fileSizeBytes: 0
            };
        }
    }

    private getMcResolution(quality: string): number {
        switch (quality) {
        case 'draft': return 128;
        case 'standard': return 256;
        case 'high': return 512;
        default: return 256;
        }
    }

    private getPolyCount(quality: string): number {
        switch (quality) {
        case 'draft': return 10000;
        case 'standard': return 30000;
        case 'high': return 100000;
        default: return 30000;
        }
    }
}

/**
 * Convenience constructors for specific fal.ai models.
 */
export class FalTripoSRProvider extends FalAIProvider {
    constructor(apiKey?: string) { super(apiKey, 'triposr'); }
}

export class FalMeshyV6Provider extends FalAIProvider {
    constructor(apiKey?: string) { super(apiKey, 'meshy-v6'); }
}

export class FalHunyuan3DProvider extends FalAIProvider {
    constructor(apiKey?: string) { super(apiKey, 'hunyuan-3d'); }
}
