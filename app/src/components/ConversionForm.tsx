'use client';

import { useState } from 'react';
import { Sparkles, Settings2 } from 'lucide-react';

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

export default function ConversionForm({ onSubmit, loading = false, plan = 'FREE' }: ConversionFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [quality, setQuality] = useState('standard');
    const [format, setFormat] = useState('glb');
    const [textured, setTextured] = useState(true);
    const [aiProvider, setAiProvider] = useState('fal-meshy-v6');

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
            {/* Quality */}
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

            {/* Format */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Output Format</label>
                <div className="grid grid-cols-4 gap-3">
                    {formatOptions.map((opt) => {
                        const available = opt.plans.includes(plan);
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
                                {!available && (
                                    <div className="text-xs text-brand-400 mt-1">Upgrade</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Advanced options */}
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
                        <label className="block text-sm text-gray-400 mb-2">AI Provider</label>
                        <select
                            value={aiProvider}
                            onChange={(e) => setAiProvider(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                        >
                            <optgroup label="fal.ai (Recommended)">
                                <option value="fal-meshy-v6">Meshy v6 — Production quality, PBR textures</option>
                                <option value="fal-triposr">TripoSR — Fast, lightweight</option>
                                <option value="fal-hunyuan-3d">Hunyuan 3D — Text-guided generation</option>
                            </optgroup>
                            <optgroup label="Direct Providers">
                                <option value="meshy">Meshy AI (Direct)</option>
                                <option value="triposr">TripoSR (Stability AI)</option>
                                <option value="openai">OpenAI Shap-E</option>
                            </optgroup>
                        </select>
                    </div>
                </div>
            )}

            {/* Submit */}
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
                        Convert to 3D
                    </>
                )}
            </button>
        </div>
    );
}
