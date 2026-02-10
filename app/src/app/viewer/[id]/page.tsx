'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, Download, Copy, Check, Pencil, Eye } from 'lucide-react';
import Link from 'next/link';
import PlayCanvasViewer from '@/components/PlayCanvasViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ModelData {
    id: string;
    name: string;
    description?: string;
    modelUrl: string;
    originalImageUrl: string;
    thumbnailUrl?: string;
    format: string;
    fileSizeBytes: number;
    vertexCount?: number;
    faceCount?: number;
    isPublic: boolean;
    shareToken?: string;
    createdAt: string;
}

export default function ViewerPage() {
    const params = useParams();
    const [model, setModel] = useState<ModelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [transform, setTransform] = useState<{ pos: number[]; rot: number[]; scl: number[] } | null>(null);

    useEffect(() => {
        async function loadModel() {
            try {
                const res = await fetch(`/api/models/${params.id}`);
                if (!res.ok) throw new Error('Model not found');
                const data = await res.json();
                setModel(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load model');
            } finally {
                setLoading(false);
            }
        }
        loadModel();
    }, [params.id]);

    const copyShareLink = () => {
        if (!model?.shareToken) return;
        const url = `${window.location.origin}/viewer/${model.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-2xl font-bold text-destructive mb-2">Model not found</h1>
                <p className="text-muted-foreground mb-6">{error || 'This model may have been deleted or is not accessible.'}</p>
                <Button asChild variant="brand">
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard">
                            <ArrowLeft size={20} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">{model.name}</h1>
                        {model.description && (
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                        onClick={() => setEditMode(!editMode)}
                        variant={editMode ? 'brand' : 'secondary'}
                        size="sm"
                        className="flex-1 sm:flex-initial"
                    >
                        {editMode ? <Eye size={16} className="mr-1.5" /> : <Pencil size={16} className="mr-1.5" />}
                        <span className="hidden sm:inline">{editMode ? 'View Mode' : 'Edit Mode'}</span>
                        <span className="sm:hidden">{editMode ? 'View' : 'Edit'}</span>
                    </Button>
                    <Button onClick={copyShareLink} variant="outline" size="sm">
                        {copied ? <Check size={16} className="mr-1.5" /> : <Share2 size={16} className="mr-1.5" />}
                        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                    </Button>
                    <Button asChild variant="brand" size="sm">
                        <a href={model.modelUrl} download>
                            <Download size={16} className="mr-1.5" />
                            <span className="hidden sm:inline">Download {model.format.toUpperCase()}</span>
                            <span className="sm:hidden">{model.format.toUpperCase()}</span>
                        </a>
                    </Button>
                </div>
            </div>

            {/* Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <PlayCanvasViewer
                        modelUrl={model.modelUrl}
                        format={model.format}
                        className="aspect-[4/3] sm:aspect-[16/10] w-full"
                        editable={editMode}
                        autoRotate={!editMode}
                        onTransform={(pos, rot, scl) => setTransform({ pos, rot, scl })}
                    />
                </div>

                {/* Sidebar info */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Original image */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Original Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={model.originalImageUrl}
                                alt="Original"
                                className="w-full rounded-lg bg-muted object-contain max-h-48"
                            />
                        </CardContent>
                    </Card>

                    {/* Model details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Model Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <DetailRow label="Format" value={model.format.toUpperCase()} />
                            <DetailRow label="File Size" value={formatBytes(model.fileSizeBytes)} />
                            {model.vertexCount && (
                                <DetailRow label="Vertices" value={model.vertexCount.toLocaleString()} />
                            )}
                            {model.faceCount && (
                                <DetailRow label="Faces" value={model.faceCount.toLocaleString()} />
                            )}
                            <DetailRow label="Created" value={new Date(model.createdAt).toLocaleDateString()} />
                            <DetailRow label="Visibility" value={model.isPublic ? 'Public' : 'Private'} />
                        </CardContent>
                    </Card>

                    {/* Transform info (edit mode) */}
                    {editMode && transform && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground">Transform</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs font-mono">
                                <div className="p-2 bg-muted rounded-lg">
                                    <span className="text-muted-foreground">Position</span>
                                    <div className="text-foreground mt-1">
                                        X: {transform.pos[0].toFixed(3)} &nbsp;
                                        Y: {transform.pos[1].toFixed(3)} &nbsp;
                                        Z: {transform.pos[2].toFixed(3)}
                                    </div>
                                </div>
                                <div className="p-2 bg-muted rounded-lg">
                                    <span className="text-muted-foreground">Rotation</span>
                                    <div className="text-foreground mt-1">
                                        X: {transform.rot[0].toFixed(1)} &nbsp;
                                        Y: {transform.rot[1].toFixed(1)} &nbsp;
                                        Z: {transform.rot[2].toFixed(1)}
                                    </div>
                                </div>
                                <div className="p-2 bg-muted rounded-lg">
                                    <span className="text-muted-foreground">Scale</span>
                                    <div className="text-foreground mt-1">
                                        X: {transform.scl[0].toFixed(3)} &nbsp;
                                        Y: {transform.scl[1].toFixed(3)} &nbsp;
                                        Z: {transform.scl[2].toFixed(3)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Copy embed code */}
                    {model.isPublic && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground">Embed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-muted rounded-lg">
                                    <code className="text-xs text-foreground/80 break-all">
                                        {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/viewer/${model.id}?embed=true" width="640" height="480"></iframe>`}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `<iframe src="${window.location.origin}/viewer/${model.id}?embed=true" width="640" height="480"></iframe>`
                                            );
                                        }}
                                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                                    >
                                        <Copy size={12} /> Copy embed code
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm text-foreground font-medium">{value}</span>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}
