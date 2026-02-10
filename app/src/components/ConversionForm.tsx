'use client';

import { useState } from 'react';
import { Sparkles, Settings2, Zap, Crown } from 'lucide-react';

interface ConversionFormProps {
    onSubmit: (options: ConversionOptions) => void;
    loading?: boolean;
    plan?: string;
}

interface ConversionOptions {
    quality: string;
    format: string;
    textured: boolean;
    aiProvider: string;
}

const AI_ENGINES = [
    {
        id: 'fal-meshy-v6',
        name: 'Meshy v6',
        badge: 'fal.ai',
        description: 'Production-ready 3D with PBR textures. Multi-format export.',
        icon: Crown,
        color: 'brand',
        speed: 'Medium',
        quality: 'Highest',
        formats: ['glb', 'gltf', 'obj', 'fbx']
    },
    {
        id: 'segmind-hunyuan3d',
        name: 'Hunyuan 3D',
        badge: 'Segmind',
        description: 'Multiview reconstruction. Instant results, no queue wait.',
        icon: Zap,
        color: 'purple',
        speed: 'Fast',
        quality: 'High',
        formats: ['glb']
    }
] as const;

export default function ConversionForm({ onSubmit, loading = false, plan = 'FREE' }: ConversionFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [quality, setQuality] = useState('standard');
    const [format, setFormat] = useState('glb');
    const [textured, setTextured] = useState(true);
    const [selectedEngine, setSelectedEngine] = useState(0); // 0 = Meshy, 1 = Hunyuan
    const [customProvider, setCustomProvider] = useState('');

    const activeEngine = AI_ENGINES[selectedEngine];
    const aiProvider = customProvider || activeEngine.id;

    const qualityOptions = [
        { value: 'draft', label: 'Draft', desc: 'Fast, lower detail', plans: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] },
        { value: 'standard', label: 'Standard', desc: 'Balanced quality', plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
        { value: 'high', label: 'High', desc: 'Maximum detail', plans: ['PRO', 'ENTERPRISE'] }
    ];

    const formatOptions = [
        { value: 'glb', label: 'GLB', desc: 'Binary glTF (recommended)', plans: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] },
        { value: 'gltf', label: 'glTF', desc: 'Standard 3D format', plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
        { value: 'obj', label: 'OBJ', desc: 'Wavefront OBJ', plans: ['PRO', 'ENTERPRISE'] },
        { value: 'fbx', label: 'FBX', desc: 'Autodesk FBX', plans: ['PRO', 'ENTERPRISE'] }
    ];

    return (
        <div className="space-y-6">
            {/* ─── AI Engine Toggle ─── */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">AI Engine</label>
                <div className="grid grid-cols-2 gap-3">
                    {AI_ENGINES.map((engine, idx) => {
                        const Icon = engine.icon;
                        const isActive = selectedEngine === idx && !customProvider;
                        const colorMap: Record<string, { border: string; bg: string; badge: string }> = {
                            brand: {
                                border: 'border-brand-500',
                                bg: 'bg-brand-500/10',
                                badge: 'bg-brand-500/20 text-brand-300'
                            },
                            purple: {
                                border: 'border-purple-500',
                                bg: 'bg-purple-500/10',
                                badge: 'bg-purple-500/20 text-purple-300'
                            }
                        };
                        const colors = colorMap[engine.color];

                        return (
                            <button
                                key={engine.id}
                                onClick={() => {
                                    setSelectedEngine(idx);
                                    setCustomProvider('');
                                    // Auto-switch format if engine doesn't support current
                                    if (!engine.formats.includes(format)) {
                                        setFormat('glb');
                                    }
                                }}
                                className={`relative p-4 rounded-xl text-left border-2 transition ${
                                    isActive
                                        ? `${colors.border} ${colors.bg}`
                                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                                }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                                        engine.color === 'brand' ? 'bg-brand-400' : 'bg-purple-400'
                                    } animate-pulse`} />
                                )}

                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={18} className={isActive
                                        ? (engine.color === 'brand' ? 'text-brand-400' : 'text-purple-400')
                                        : 'text-gray-400'
                                    } />
                                    <span className="font-semibold text-white">{engine.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                        isActive ? colors.badge : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {engine.badge}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 mb-3">{engine.description}</p>

                                <div className="flex gap-3 text-[11px]">
                                    <span className="text-gray-500">Speed: <span className="text-gray-300">{engine.speed}</span></span>
                                    <span className="text-gray-500">Quality: <span className="text-gray-300">{engine.quality}</span></span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Quality ─── */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Quality</label>
                <div className="grid grid-cols-3 gap-3">
                    {qualityOptions.map((opt) => {
                        const available = opt.plans.includes(plan);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => available && setQuality(opt.value)}
                                disabled={!available}
                                className={`p-3 rounded-xl text-left border transition ${
                                    quality === opt.value
                                        ? 'border-brand-500 bg-brand-500/10'
                                        : available
                                            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                                            : 'border-gray-800 bg-gray-800/20 opacity-40 cursor-not-allowed'
                                }`}
                            >
                                <div className="text-sm font-medium text-white">{opt.label}</div>
                                <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
                                {!available && (
                                    <div className="text-xs text-brand-400 mt-1">Upgrade required</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Format ─── */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Output Format</label>
                <div className="grid grid-cols-4 gap-3">
                    {formatOptions.map((opt) => {
                        const planAvailable = opt.plans.includes(plan);
                        const engineSupports = activeEngine.formats.includes(opt.value);
                        const available = planAvailable && (engineSupports || !!customProvider);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => available && setFormat(opt.value)}
                                disabled={!available}
                                className={`p-3 rounded-xl text-center border transition ${
                                    format === opt.value
                                        ? 'border-brand-500 bg-brand-500/10'
                                        : available
                                            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                                            : 'border-gray-800 bg-gray-800/20 opacity-40 cursor-not-allowed'
                                }`}
                            >
                                <div className="text-sm font-bold text-white">{opt.label}</div>
                                {!planAvailable && (
                                    <div className="text-xs text-brand-400 mt-1">Upgrade</div>
                                )}
                                {planAvailable && !engineSupports && !customProvider && (
                                    <div className="text-xs text-gray-500 mt-1">Switch engine</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Advanced Options ─── */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
                <Settings2 size={16} />
                Advanced Options
            </button>

            {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={textured}
                            onChange={(e) => setTextured(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-300">Generate textures (PBR materials)</span>
                    </label>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Override AI Provider</label>
                        <select
                            value={customProvider}
                            onChange={(e) => setCustomProvider(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                        >
                            <option value="">Use selected engine above</option>
                            <optgroup label="fal.ai">
                                <option value="fal-meshy-v6">fal.ai Meshy v6</option>
                                <option value="fal-triposr">fal.ai TripoSR</option>
                                <option value="fal-hunyuan-3d">fal.ai Hunyuan 3D</option>
                            </optgroup>
                            <optgroup label="Segmind">
                                <option value="segmind-hunyuan3d">Segmind Hunyuan3D-2mv</option>
                            </optgroup>
                            <optgroup label="Direct APIs">
                                <option value="meshy">Meshy AI (Direct)</option>
                                <option value="triposr">TripoSR (Stability AI)</option>
                                <option value="openai">OpenAI Shap-E</option>
                            </optgroup>
                        </select>
                        {customProvider && (
                            <p className="text-xs text-yellow-400 mt-1">
                                Overriding engine selection. Clear to use toggle above.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Submit ─── */}
            <button
                onClick={() => onSubmit({ quality, format, textured, aiProvider })}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                    loading
                        ? 'bg-brand-700 cursor-wait'
                        : 'bg-brand-600 hover:bg-brand-500'
                }`}
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting conversion...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} />
                        Convert to 3D with {customProvider ? 'Custom Provider' : activeEngine.name}
                    </>
                )}
            </button>
        </div>
    );
}
