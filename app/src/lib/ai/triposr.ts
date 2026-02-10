import { AIProvider } from './base';
import type { AIConversionInput, AIProviderStatus } from '@/types';

/**
 * Stability AI TripoSR provider — fast single-image 3D reconstruction.
 * https://platform.stability.ai
 */
export class TripoSRProvider extends AIProvider {
    readonly name = 'triposr';
    readonly supportedFormats = ['glb', 'gltf', 'obj'];
    readonly supportedQualities = ['draft', 'standard', 'high'];

    private apiKey: string;
    private baseUrl = 'https://api.stability.ai/v2beta/3d';

    constructor(apiKey?: string) {
        super();
        this.apiKey = apiKey || process.env.STABILITY_API_KEY || '';
    }

    async startConversion(input: AIConversionInput): Promise<string> {
        // Download the image first to send as multipart
        const imageResponse = await fetch(input.imageUrl);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('image', imageBlob, 'input.png');
        formData.append('texture_resolution', this.getTextureRes(input.quality));
        formData.append('foreground_ratio', '0.85');

        const response = await fetch(`${this.baseUrl}/stable-fast-3d`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Stability API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.id;
    }

    async getStatus(taskId: string): Promise<AIProviderStatus> {
        const response = await fetch(`${this.baseUrl}/stable-fast-3d/result/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 202) {
            return {
                taskId,
                status: 'processing',
                progress: 50
            };
        }

        if (!response.ok) {
            return {
                taskId,
                status: 'failed',
                progress: 0,
                error: `Status check failed: ${response.status}`
            };
        }

        const data = await response.json();

        if (data.status === 'complete') {
            return {
                taskId,
                status: 'completed',
                progress: 100,
                result: {
                    modelUrl: data.output.model,
                    thumbnailUrl: data.output.thumbnail,
                    fileSizeBytes: data.output.size || 0
                }
            };
        }

        return {
            taskId,
            status: this.mapStatus(data.status),
            progress: data.progress || 0,
            error: data.error
        };
    }

    async cancelConversion(_taskId: string): Promise<void> {
        // TripoSR tasks are fast and don't support cancellation
    }

    private mapStatus(status: string): AIProviderStatus['status'] {
        switch (status) {
        case 'pending': return 'pending';
        case 'processing':
        case 'in-progress': return 'processing';
        case 'complete': return 'completed';
        case 'failed': return 'failed';
        default: return 'processing';
        }
    }

    private getTextureRes(quality: string): string {
        switch (quality) {
        case 'draft': return '512';
        case 'standard': return '1024';
        case 'high': return '2048';
        default: return '1024';
        }
    }
}
