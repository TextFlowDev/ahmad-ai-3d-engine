import { AIProvider } from './base';
import type { AIConversionInput, AIProviderStatus } from '@/types';

/**
 * Meshy AI provider — image-to-3D conversion via Meshy API.
 * https://docs.meshy.ai
 */
export class MeshyProvider extends AIProvider {
    readonly name = 'meshy';
    readonly supportedFormats = ['glb', 'gltf', 'obj', 'fbx'];
    readonly supportedQualities = ['draft', 'standard', 'high'];

    private apiKey: string;
    private baseUrl = 'https://api.meshy.ai/v2';

    constructor(apiKey?: string) {
        super();
        this.apiKey = apiKey || process.env.MESHY_API_KEY || '';
    }

    async startConversion(input: AIConversionInput): Promise<string> {
        const response = await fetch(`${this.baseUrl}/image-to-3d`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_url: input.imageUrl,
                enable_pbr: input.textured,
                ai_model: input.quality === 'high' ? 'meshy-4' : 'meshy-4',
                topology: 'quad',
                target_polycount: this.getPolyCount(input.quality)
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Meshy API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.result;
    }

    async getStatus(taskId: string): Promise<AIProviderStatus> {
        const response = await fetch(`${this.baseUrl}/image-to-3d/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Meshy status check failed: ${response.status}`);
        }

        const data = await response.json();

        return {
            taskId,
            status: this.mapStatus(data.status),
            progress: data.progress || 0,
            result: data.status === 'SUCCEEDED' ? {
                modelUrl: data.model_urls?.glb || data.model_urls?.obj,
                thumbnailUrl: data.thumbnail_url,
                vertexCount: data.vertex_count,
                faceCount: data.face_count,
                fileSizeBytes: data.file_size || 0
            } : undefined,
            error: data.task_error?.message
        };
    }

    async cancelConversion(_taskId: string): Promise<void> {
        // Meshy doesn't support cancellation — just stop polling
    }

    private mapStatus(meshyStatus: string): AIProviderStatus['status'] {
        switch (meshyStatus) {
        case 'PENDING':
        case 'IN_QUEUE':
            return 'pending';
        case 'IN_PROGRESS':
            return 'processing';
        case 'SUCCEEDED':
            return 'completed';
        case 'FAILED':
        case 'EXPIRED':
            return 'failed';
        default:
            return 'processing';
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
