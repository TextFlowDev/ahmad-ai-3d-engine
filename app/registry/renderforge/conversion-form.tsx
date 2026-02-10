'use client';

import { useState } from 'react';
import { Sparkles, Settings2, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel as SelectGroupLabel } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
    const [selectedEngine, setSelectedEngine] = useState(0);
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
            {/* AI Engine Toggle */}
            <div>
                <Label className="mb-3 block">AI Engine</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AI_ENGINES.map((engine, idx) => {
                        const Icon = engine.icon;
                        const isActive = selectedEngine === idx && !customProvider;
                        return (
                            <button
                                key={engine.id}
                                onClick={() => {
                                    setSelectedEngine(idx);
                                    setCustomProvider('');
                                    if (!engine.formats.includes(format)) setFormat('glb');
                                }}
                                className={cn(
                                    'relative p-4 rounded-lg text-left border-2 transition',
                                    isActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-muted-foreground bg-card/50'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                                    <span className="font-semibold text-foreground">{engine.name}</span>
                                    <Badge variant={isActive ? 'brand' : 'secondary'} className="text-[10px] px-1.5">
                                        {engine.badge}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{engine.description}</p>
                                <div className="flex gap-3 text-[11px]">
                                    <span className="text-muted-foreground">Speed: <span className="text-foreground">{engine.speed}</span></span>
                                    <span className="text-muted-foreground">Quality: <span className="text-foreground">{engine.quality}</span></span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quality */}
            <div>
                <Label className="mb-3 block">Quality</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {qualityOptions.map((opt) => {
                        const available = opt.plans.includes(plan);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => available && setQuality(opt.value)}
                                disabled={!available}
                                className={cn(
                                    'p-3 rounded-lg text-left border transition',
                                    quality === opt.value
                                        ? 'border-primary bg-primary/10'
                                        : available
                                            ? 'border-border hover:border-muted-foreground bg-card/50'
                                            : 'border-border bg-card/20 opacity-40 cursor-not-allowed'
                                )}
                            >
                                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                                <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{opt.desc}</div>
                                {!available && (
                                    <div className="text-xs text-primary mt-1">Upgrade</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Format */}
            <div>
                <Label className="mb-3 block">Output Format</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {formatOptions.map((opt) => {
                        const planAvailable = opt.plans.includes(plan);
                        const engineSupports = activeEngine.formats.includes(opt.value);
                        const available = planAvailable && (engineSupports || !!customProvider);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => available && setFormat(opt.value)}
                                disabled={!available}
                                className={cn(
                                    'p-3 rounded-lg text-center border transition',
                                    format === opt.value
                                        ? 'border-primary bg-primary/10'
                                        : available
                                            ? 'border-border hover:border-muted-foreground bg-card/50'
                                            : 'border-border bg-card/20 opacity-40 cursor-not-allowed'
                                )}
                            >
                                <div className="text-sm font-bold text-foreground">{opt.label}</div>
                                {!planAvailable && <div className="text-xs text-primary mt-1">Upgrade</div>}
                                {planAvailable && !engineSupports && !customProvider && (
                                    <div className="text-xs text-muted-foreground mt-1">Switch engine</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Advanced Options */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
                <Settings2 size={16} />
                Advanced Options
            </button>

            {showAdvanced && (
                <div className="space-y-4 p-4 bg-card/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <Switch
                            id="textured"
                            checked={textured}
                            onCheckedChange={setTextured}
                        />
                        <Label htmlFor="textured">Generate textures (PBR materials)</Label>
                    </div>

                    <div>
                        <Label className="mb-2 block">Override AI Provider</Label>
                        <Select value={customProvider} onValueChange={setCustomProvider}>
                            <SelectTrigger>
                                <SelectValue placeholder="Use selected engine above" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">Use selected engine above</SelectItem>
                                <SelectGroup>
                                    <SelectGroupLabel>fal.ai</SelectGroupLabel>
                                    <SelectItem value="fal-meshy-v6">fal.ai Meshy v6</SelectItem>
                                    <SelectItem value="fal-triposr">fal.ai TripoSR</SelectItem>
                                    <SelectItem value="fal-hunyuan-3d">fal.ai Hunyuan 3D</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectGroupLabel>Segmind</SelectGroupLabel>
                                    <SelectItem value="segmind-hunyuan3d">Segmind Hunyuan3D-2mv</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectGroupLabel>Direct APIs</SelectGroupLabel>
                                    <SelectItem value="meshy">Meshy AI (Direct)</SelectItem>
                                    <SelectItem value="triposr">TripoSR (Stability AI)</SelectItem>
                                    <SelectItem value="openai">OpenAI Shap-E</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {customProvider && customProvider !== ' ' && (
                            <p className="text-xs text-yellow-500 mt-1">
                                Overriding engine selection. Clear to use toggle above.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Submit */}
            <Button
                onClick={() => onSubmit({ quality, format, textured, aiProvider: customProvider?.trim() || aiProvider })}
                disabled={loading}
                variant="brand"
                size="lg"
                className="w-full py-4 text-base"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-brand-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Starting conversion...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} className="mr-2" />
                        Convert to 3D with {customProvider && customProvider !== ' ' ? 'Custom Provider' : activeEngine.name}
                    </>
                )}
            </Button>
        </div>
    );
}
