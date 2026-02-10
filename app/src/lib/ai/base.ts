import type { AIConversionInput, AIConversionResult, AIProviderStatus } from '@/types';

/**
 * Base class for all AI 2D-to-3D conversion providers.
 * Implement this to add a new AI provider to the pipeline.
 */
export abstract class AIProvider {
    abstract readonly name: string;
    abstract readonly supportedFormats: string[];
    abstract readonly supportedQualities: string[];

    /**
     * Start a 2D-to-3D conversion task.
     * Returns a provider-specific task ID for polling.
     */
    abstract startConversion(input: AIConversionInput): Promise<string>;

    /**
     * Poll the status of an ongoing conversion task.
     */
    abstract getStatus(taskId: string): Promise<AIProviderStatus>;

    /**
     * Cancel an in-progress conversion task.
     */
    abstract cancelConversion(taskId: string): Promise<void>;

    /**
     * Run a full conversion: start, poll until complete, return result.
     * Override for providers with synchronous APIs.
     */
    async convert(
        input: AIConversionInput,
        onProgress?: (progress: number) => void
    ): Promise<AIConversionResult> {
        const taskId = await this.startConversion(input);

        while (true) {
            const status = await this.getStatus(taskId);

            if (onProgress) {
                onProgress(status.progress);
            }

            if (status.status === 'completed' && status.result) {
                return status.result;
            }

            if (status.status === 'failed') {
                throw new Error(status.error || 'Conversion failed');
            }

            // Poll every 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}
