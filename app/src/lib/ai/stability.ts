import { AIProvider } from './base';
import type { AIConversionInput, AIConversionResult, AIProviderStatus } from '@/types';

/**
 * OpenAI-based provider using Point-E / Shap-E for 3D generation.
 * Falls back to a self-hosted or third-party endpoint.
 */
export class OpenAIProvider extends AIProvider {
    readonly name = 'openai';
    readonly supportedFormats = ['glb', 'obj'];
    readonly supportedQualities = ['draft', 'standard'];

    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey?: string, baseUrl?: string) {
        super();
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        this.baseUrl = baseUrl || 'https://api.openai.com/v1';
    }

    async startConversion(input: AIConversionInput): Promise<string> {
        const response = await fetch(`${this.baseUrl}/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'shap-e',
                prompt: `3D model from image: ${input.imageUrl}`,
                n: 1,
                response_format: 'url'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.id || data.created?.toString() || Date.now().toString();
    }

    async getStatus(taskId: string): Promise<AIProviderStatus> {
        // OpenAI image generation is typically synchronous
        // This is a placeholder for async task polling
        return {
            taskId,
            status: 'completed',
            progress: 100
        };
    }

    async cancelConversion(_taskId: string): Promise<void> {
        // Not supported
    }

    /**
     * Override convert for synchronous-style API.
     */
    async convert(
        input: AIConversionInput,
        onProgress?: (progress: number) => void
    ): Promise<AIConversionResult> {
        if (onProgress) onProgress(10);

        const response = await fetch(`${this.baseUrl}/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'shap-e',
                prompt: `3D model from image: ${input.imageUrl}`,
                n: 1,
                response_format: 'url'
            })
        });

        if (onProgress) onProgress(80);

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();

        if (onProgress) onProgress(100);

        return {
            modelUrl: data.data?.[0]?.url || '',
            fileSizeBytes: 0
        };
    }
}
