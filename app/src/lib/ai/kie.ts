import { AIProvider } from './base';
import type { AIConversionInput, AIConversionResult, AIProviderStatus } from '@/types';

/**
 * Kie.ai provider — unified AI API gateway.
 *
 * Kie.ai is an API aggregator that provides access to multiple AI models
 * (video, image, music, LLMs) through a single credit-based API.
 *
 * NOTE: As of 2026, Kie.ai does NOT natively offer 3D model generation.
 * This provider uses Kie.ai's image generation APIs to preprocess/enhance
 * the input image, then delegates to a 3D-capable backend (Meshy, TripoSR).
 *
 * If Kie.ai adds 3D generation models in the future, this provider can
 * be updated to use them directly.
 *
 * Usage pattern:
 *   1. (Optional) Enhance input image via Kie.ai's image API (background removal, upscaling)
 *   2. Delegate 3D conversion to a fallback 3D provider
 *
 * https://docs.kie.ai
 */
export class KieAIProvider extends AIProvider {
    readonly name = 'kie';
    readonly supportedFormats = ['glb', 'gltf', 'obj', 'fbx'];
    readonly supportedQualities = ['draft', 'standard', 'high'];

    private apiKey: string;
    private baseUrl = 'https://api.kie.ai/api/v1';
    private fallbackProviderName: string;

    constructor(apiKey?: string, fallbackProvider?: string) {
        super();
        this.apiKey = apiKey || process.env.KIE_API_KEY || '';
        this.fallbackProviderName = fallbackProvider || process.env.KIE_FALLBACK_PROVIDER || 'meshy';
    }

    async startConversion(input: AIConversionInput): Promise<string> {
        // Step 1: Enhance the image using Kie.ai's image API
        // (background removal + upscaling for better 3D conversion)
        const enhancedImageUrl = await this.enhanceImage(input.imageUrl);

        // Step 2: Delegate to the 3D-capable fallback provider
        const { getAIProvider } = await import('./index');
        const fallback = getAIProvider(this.fallbackProviderName);

        const taskId = await fallback.startConversion({
            ...input,
            imageUrl: enhancedImageUrl || input.imageUrl
        });

        // Prefix task ID so we know to route status checks to fallback
        return `kie:${this.fallbackProviderName}:${taskId}`;
    }

    async getStatus(taskId: string): Promise<AIProviderStatus> {
        // Parse the compound task ID
        const parts = taskId.split(':');
        if (parts.length < 3 || parts[0] !== 'kie') {
            throw new Error(`Invalid Kie task ID: ${taskId}`);
        }

        const providerName = parts[1];
        const realTaskId = parts.slice(2).join(':');

        const { getAIProvider } = await import('./index');
        const fallback = getAIProvider(providerName);

        return fallback.getStatus(realTaskId);
    }

    async cancelConversion(taskId: string): Promise<void> {
        const parts = taskId.split(':');
        if (parts.length < 3) return;

        const providerName = parts[1];
        const realTaskId = parts.slice(2).join(':');

        const { getAIProvider } = await import('./index');
        const fallback = getAIProvider(providerName);

        return fallback.cancelConversion(realTaskId);
    }

    /**
     * Use Kie.ai's image API to preprocess the input image.
     * - Remove background for cleaner 3D extraction
     * - Upscale low-res images for better detail
     * Returns the enhanced image URL, or null if enhancement fails.
     */
    private async enhanceImage(imageUrl: string): Promise<string | null> {
        if (!this.apiKey) return null;

        try {
            // Submit image enhancement task
            const response = await fetch(`${this.baseUrl}/generate/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: '4o-image',
                    prompt: 'Remove the background from this image, keeping only the main subject on a clean white background. Enhance details and lighting for 3D model generation.',
                    image_url: imageUrl,
                    n: 1,
                    size: '1024x1024'
                })
            });

            if (!response.ok) {
                console.warn(`[Kie.ai] Image enhancement failed: ${response.status}`);
                return null;
            }

            const data = await response.json();
            const taskId = data.task_id || data.id;

            if (!taskId) return null;

            // Poll for result
            for (let i = 0; i < 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                const statusRes = await fetch(`${this.baseUrl}/task/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                });

                if (!statusRes.ok) continue;

                const statusData = await statusRes.json();

                if (statusData.status === 'completed' || statusData.status === 'success') {
                    return statusData.output?.image_url
                        || statusData.output?.url
                        || statusData.result?.url
                        || null;
                }

                if (statusData.status === 'failed') {
                    console.warn('[Kie.ai] Image enhancement task failed');
                    return null;
                }
            }

            console.warn('[Kie.ai] Image enhancement timed out');
            return null;

        } catch (error) {
            console.warn('[Kie.ai] Image enhancement error:', error);
            return null;
        }
    }
}
