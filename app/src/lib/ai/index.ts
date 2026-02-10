import { AIProvider } from './base';
import { MeshyProvider } from './meshy';
import { TripoSRProvider } from './triposr';
import { OpenAIProvider } from './stability';
import { KieAIProvider } from './kie';
import { FalAIProvider, FalTripoSRProvider, FalMeshyV6Provider, FalHunyuan3DProvider } from './fal';
import { SegmindHunyuan3DProvider } from './segmind';

export { AIProvider } from './base';
export { MeshyProvider } from './meshy';
export { TripoSRProvider } from './triposr';
export { OpenAIProvider } from './stability';
export { KieAIProvider } from './kie';
export { FalAIProvider, FalTripoSRProvider, FalMeshyV6Provider, FalHunyuan3DProvider } from './fal';
export { SegmindHunyuan3DProvider } from './segmind';

const providers: Record<string, () => AIProvider> = {
    // Direct providers
    meshy: () => new MeshyProvider(),
    triposr: () => new TripoSRProvider(),
    openai: () => new OpenAIProvider(),
    kie: () => new KieAIProvider(),

    // fal.ai providers (single API key, multiple models)
    'fal': () => new FalAIProvider(),
    'fal-triposr': () => new FalTripoSRProvider(),
    'fal-meshy-v6': () => new FalMeshyV6Provider(),
    'fal-hunyuan-3d': () => new FalHunyuan3DProvider(),

    // Segmind providers
    'segmind-hunyuan3d': () => new SegmindHunyuan3DProvider()
};

/**
 * Get an AI provider by name. Falls back to the configured default.
 */
export function getAIProvider(name?: string): AIProvider {
    const providerName = name || process.env.AI_PROVIDER || 'fal-meshy-v6';
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
