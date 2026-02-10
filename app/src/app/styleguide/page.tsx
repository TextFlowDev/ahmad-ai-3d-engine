'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Palette, Type, Layout, Sliders, RotateCcw, Download, Upload, Copy, Check, Sun, Moon, Eye } from 'lucide-react';

/* ─── Default tokens (must match globals.css :root) ─── */
const DEFAULT_TOKENS: Record<string, string> = {
    '--background': '240 10% 3.9%',
    '--foreground': '0 0% 98%',
    '--card': '240 10% 5.5%',
    '--card-foreground': '0 0% 98%',
    '--popover': '240 10% 5.5%',
    '--popover-foreground': '0 0% 98%',
    '--primary': '227 71% 63%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '240 5% 15%',
    '--secondary-foreground': '0 0% 98%',
    '--muted': '240 5% 15%',
    '--muted-foreground': '240 5% 64%',
    '--accent': '240 5% 15%',
    '--accent-foreground': '0 0% 98%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '240 6% 17%',
    '--input': '240 6% 17%',
    '--ring': '227 71% 63%',
    '--brand': '227 71% 63%',
    '--brand-foreground': '0 0% 100%',
    '--radius': '0.75rem'
};

const FONT_OPTIONS = [
    { value: "'Inter', system-ui, -apple-system, sans-serif", label: 'Inter' },
    { value: "'DM Sans', system-ui, sans-serif", label: 'DM Sans' },
    { value: "'Plus Jakarta Sans', system-ui, sans-serif", label: 'Plus Jakarta Sans' },
    { value: "'Outfit', system-ui, sans-serif", label: 'Outfit' },
    { value: "'Space Grotesk', system-ui, sans-serif", label: 'Space Grotesk' },
    { value: "system-ui, -apple-system, sans-serif", label: 'System UI' }
];

const MONO_FONT_OPTIONS = [
    { value: "'JetBrains Mono', 'Fira Code', monospace", label: 'JetBrains Mono' },
    { value: "'Fira Code', monospace", label: 'Fira Code' },
    { value: "'Source Code Pro', monospace", label: 'Source Code Pro' },
    { value: "'IBM Plex Mono', monospace", label: 'IBM Plex Mono' },
    { value: "monospace", label: 'System Mono' }
];

/* ─── HSL helpers ─── */
function parseHSL(value: string): { h: number; s: number; l: number } {
    const parts = value.trim().split(/\s+/).map(Number);
    return { h: parts[0] || 0, s: parts[1] || 0, l: parts[2] || 0 };
}

function toHSLString(h: number, s: number, l: number): string {
    return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function hslToHex(hslStr: string): string {
    const { h, s, l } = parseHSL(hslStr);
    const sNorm = s / 100;
    const lNorm = l / 100;
    const a = sNorm * Math.min(lNorm, 1 - lNorm);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): string {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255;
        g = parseInt(hex[1] + hex[1], 16) / 255;
        b = parseInt(hex[2] + hex[2], 16) / 255;
    } else {
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return toHSLString(h * 360, s * 100, l * 100);
}

/* ─── Color Editor Row ─── */
function ColorRow({
    label,
    token,
    value,
    onChange
}: {
    label: string;
    token: string;
    value: string;
    onChange: (token: string, val: string) => void;
}) {
    const hex = hslToHex(value);
    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={hex}
                onChange={(e) => onChange(token, hexToHSL(e.target.value))}
                className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent p-0.5"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                <p className="text-xs text-muted-foreground font-mono">{token}</p>
            </div>
            <code className="text-xs text-muted-foreground font-mono hidden sm:block">{value}</code>
        </div>
    );
}

/* ─── Main Styleguide Page ─── */
export default function StyleguidePage() {
    const [tokens, setTokens] = useState<Record<string, string>>({ ...DEFAULT_TOKENS });
    const [fontSans, setFontSans] = useState(FONT_OPTIONS[0].value);
    const [fontMono, setFontMono] = useState(MONO_FONT_OPTIONS[0].value);
    const [copied, setCopied] = useState(false);

    /* Apply tokens to :root in real-time */
    const applyTokens = useCallback((t: Record<string, string>) => {
        const root = document.documentElement;
        Object.entries(t).forEach(([key, val]) => {
            root.style.setProperty(key, val);
        });
    }, []);

    useEffect(() => {
        applyTokens(tokens);
    }, [tokens, applyTokens]);

    useEffect(() => {
        document.documentElement.style.setProperty('--font-sans', fontSans);
    }, [fontSans]);

    useEffect(() => {
        document.documentElement.style.setProperty('--font-mono', fontMono);
    }, [fontMono]);

    const updateToken = (key: string, value: string) => {
        setTokens(prev => ({ ...prev, [key]: value }));
    };

    const resetAll = () => {
        setTokens({ ...DEFAULT_TOKENS });
        setFontSans(FONT_OPTIONS[0].value);
        setFontMono(MONO_FONT_OPTIONS[0].value);
        // Clear inline styles
        const root = document.documentElement;
        Object.keys(DEFAULT_TOKENS).forEach(key => root.style.removeProperty(key));
        root.style.removeProperty('--font-sans');
        root.style.removeProperty('--font-mono');
    };

    const exportCSS = () => {
        let css = ':root {\n';
        Object.entries(tokens).forEach(([key, val]) => {
            css += `    ${key}: ${val};\n`;
        });
        css += `    --font-sans: ${fontSans};\n`;
        css += `    --font-mono: ${fontMono};\n`;
        css += '}\n';
        return css;
    };

    const copyCSS = () => {
        navigator.clipboard.writeText(exportCSS());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCSS = () => {
        const blob = new Blob([exportCSS()], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'renderforge-theme.css';
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ─── Color groups ─── */
    const colorGroups = [
        {
            title: 'Base',
            colors: [
                { label: 'Background', token: '--background' },
                { label: 'Foreground', token: '--foreground' },
                { label: 'Card', token: '--card' },
                { label: 'Card Foreground', token: '--card-foreground' },
                { label: 'Popover', token: '--popover' },
                { label: 'Popover Foreground', token: '--popover-foreground' }
            ]
        },
        {
            title: 'Brand & Primary',
            colors: [
                { label: 'Brand', token: '--brand' },
                { label: 'Brand Foreground', token: '--brand-foreground' },
                { label: 'Primary', token: '--primary' },
                { label: 'Primary Foreground', token: '--primary-foreground' },
                { label: 'Ring', token: '--ring' }
            ]
        },
        {
            title: 'Semantic',
            colors: [
                { label: 'Secondary', token: '--secondary' },
                { label: 'Secondary Foreground', token: '--secondary-foreground' },
                { label: 'Muted', token: '--muted' },
                { label: 'Muted Foreground', token: '--muted-foreground' },
                { label: 'Accent', token: '--accent' },
                { label: 'Accent Foreground', token: '--accent-foreground' }
            ]
        },
        {
            title: 'State',
            colors: [
                { label: 'Destructive', token: '--destructive' },
                { label: 'Destructive Foreground', token: '--destructive-foreground' },
                { label: 'Border', token: '--border' },
                { label: 'Input', token: '--input' }
            ]
        }
    ];

    const radiusValue = parseFloat(tokens['--radius']) || 0.75;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-primary" />
                        <h1 className="text-lg font-bold">Styleguide</h1>
                        <Badge variant="outline" className="text-xs">Internal</Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={resetAll}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Reset
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyCSS}>
                            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copied ? 'Copied' : 'Copy CSS'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadCSS}>
                            <Download className="w-4 h-4 mr-1" /> Export
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* ─── Left: Controls ─── */}
                    <div className="lg:col-span-1 space-y-6">
                        <Tabs defaultValue="colors">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="colors"><Palette className="w-4 h-4 mr-1 hidden sm:inline" /> Colors</TabsTrigger>
                                <TabsTrigger value="typography"><Type className="w-4 h-4 mr-1 hidden sm:inline" /> Type</TabsTrigger>
                                <TabsTrigger value="spacing"><Sliders className="w-4 h-4 mr-1 hidden sm:inline" /> Spacing</TabsTrigger>
                            </TabsList>

                            {/* Colors Tab */}
                            <TabsContent value="colors" className="space-y-6 mt-4">
                                {colorGroups.map(group => (
                                    <Card key={group.title}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">{group.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {group.colors.map(c => (
                                                <ColorRow
                                                    key={c.token}
                                                    label={c.label}
                                                    token={c.token}
                                                    value={tokens[c.token]}
                                                    onChange={updateToken}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            {/* Typography Tab */}
                            <TabsContent value="typography" className="space-y-6 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Font Families</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="mb-2 block">Sans-Serif (Body)</Label>
                                            <Select value={fontSans} onValueChange={setFontSans}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {FONT_OPTIONS.map(f => (
                                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="mb-2 block">Monospace (Code)</Label>
                                            <Select value={fontMono} onValueChange={setFontMono}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {MONO_FONT_OPTIONS.map(f => (
                                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Type Scale</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-4xl font-bold">Heading 1</p>
                                        <p className="text-3xl font-bold">Heading 2</p>
                                        <p className="text-2xl font-semibold">Heading 3</p>
                                        <p className="text-xl font-semibold">Heading 4</p>
                                        <p className="text-base">Body text — The quick brown fox jumps over the lazy dog.</p>
                                        <p className="text-sm text-muted-foreground">Small text with muted color</p>
                                        <p className="text-xs text-muted-foreground">Extra small / caption text</p>
                                        <p className="font-mono text-sm">Monospace: const x = 42;</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Spacing Tab */}
                            <TabsContent value="spacing" className="space-y-6 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Border Radius</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Radius</Label>
                                            <code className="text-xs text-muted-foreground font-mono">{tokens['--radius']}</code>
                                        </div>
                                        <Slider
                                            min={0}
                                            max={24}
                                            step={1}
                                            value={[radiusValue * 16]}
                                            onValueChange={([v]) => updateToken('--radius', `${(v / 16).toFixed(2)}rem`)}
                                        />
                                        <div className="flex gap-3 flex-wrap">
                                            {['0rem', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem'].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => updateToken('--radius', r)}
                                                    className={`px-3 py-1.5 text-xs rounded-md border transition ${
                                                        tokens['--radius'] === r
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border hover:border-muted-foreground'
                                                    }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Radius Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="aspect-square bg-primary/20 border border-primary rounded-sm flex items-center justify-center text-xs">sm</div>
                                            <div className="aspect-square bg-primary/20 border border-primary rounded-md flex items-center justify-center text-xs">md</div>
                                            <div className="aspect-square bg-primary/20 border border-primary rounded-lg flex items-center justify-center text-xs">lg</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* ─── Right: Preview ─── */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Component Preview</CardTitle>
                                <CardDescription>Live preview of all components with current theme</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Buttons */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Buttons</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <Button>Primary</Button>
                                        <Button variant="brand">Brand</Button>
                                        <Button variant="secondary">Secondary</Button>
                                        <Button variant="outline">Outline</Button>
                                        <Button variant="ghost">Ghost</Button>
                                        <Button variant="destructive">Destructive</Button>
                                        <Button variant="link">Link</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        <Button size="sm">Small</Button>
                                        <Button size="default">Default</Button>
                                        <Button size="lg">Large</Button>
                                        <Button size="icon"><Eye className="w-4 h-4" /></Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Badges */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Badges</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>Default</Badge>
                                        <Badge variant="brand">Brand</Badge>
                                        <Badge variant="secondary">Secondary</Badge>
                                        <Badge variant="destructive">Destructive</Badge>
                                        <Badge variant="outline">Outline</Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* Inputs */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Form Elements</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="preview-input">Text Input</Label>
                                            <Input id="preview-input" placeholder="Enter text..." className="mt-1.5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="preview-email">Email Input</Label>
                                            <Input id="preview-email" type="email" placeholder="email@example.com" className="mt-1.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <Switch id="toggle-preview" />
                                            <Label htmlFor="toggle-preview">Toggle switch</Label>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Progress */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Progress</h3>
                                    <div className="space-y-3">
                                        <Progress value={25} />
                                        <Progress value={60} />
                                        <Progress value={90} />
                                    </div>
                                </div>

                                <Separator />

                                {/* Cards */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Cards</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Feature Card</CardTitle>
                                                <CardDescription>Short description of the feature</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm">Card content goes here with your details.</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button size="sm">Action</Button>
                                            </CardFooter>
                                        </Card>
                                        <Card className="border-primary">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">Highlighted</CardTitle>
                                                    <Badge variant="brand">Popular</Badge>
                                                </div>
                                                <CardDescription>This card has a primary border</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm">Highlighted card for special content.</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="brand" size="sm">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </div>

                                <Separator />

                                {/* Color Swatches */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Color Swatches</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        <Swatch bg="bg-background" border label="Background" />
                                        <Swatch bg="bg-foreground" label="Foreground" />
                                        <Swatch bg="bg-primary" label="Primary" />
                                        <Swatch bg="bg-secondary" label="Secondary" />
                                        <Swatch bg="bg-muted" label="Muted" />
                                        <Swatch bg="bg-accent" label="Accent" />
                                        <Swatch bg="bg-destructive" label="Destructive" />
                                        <Swatch bg="bg-brand" label="Brand" />
                                        <Swatch bg="bg-card" border label="Card" />
                                        <Swatch bg="bg-border" label="Border" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CSS Output */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Generated CSS</CardTitle>
                                <CardDescription>Copy this into your globals.css :root block</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto max-h-64">
                                    {exportCSS()}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Swatch({ bg, label, border }: { bg: string; label: string; border?: boolean }) {
    return (
        <div className="text-center">
            <div className={`w-full aspect-square rounded-lg ${bg} ${border ? 'border border-border' : ''}`} />
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
    );
}
