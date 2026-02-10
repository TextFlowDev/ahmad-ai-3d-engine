import { AIProvider } from './base';
import { MeshyProvider } from './meshy';
import { TripoSRProvider } from './triposr';
import { OpenAIProvider } from './stability';

export { AIProvider } from './base';
export { MeshyProvider } from './meshy';
export { TripoSRProvider } from './triposr';
export { OpenAIProvider } from './stability';

const providers: Record<string, () => AIProvider> = {
    meshy: () => new MeshyProvider(),
    triposr: () => new TripoSRProvider(),
    openai: () => new OpenAIProvider()
};

/**
 * Get an AI provider by name. Falls back to the configured default.
 */
export function getAIProvider(name?: string): AIProvider {
    const providerName = name || process.env.AI_PROVIDER || 'meshy';
    const factory = providers[providerName];

    if (!factory) {
        throw new Error(
            `Unknown AI provider: "${providerName}". Available: ${Object.keys(providers).join(', ')}`
        );
    }

    return factory();
}

/**
 * Register a custom AI provider at runtime.
 */
export function registerAIProvider(name: string, factory: () => AIProvider) {
    providers[name] = factory;
}

/**
 * List all available provider names.
 */
export function listProviders(): string[] {
    return Object.keys(providers);
}
