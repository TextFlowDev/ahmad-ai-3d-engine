'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, Download, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import PlayCanvasViewer from '@/components/PlayCanvasViewer';

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
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-2xl font-bold text-red-400 mb-2">Model not found</h1>
                <p className="text-gray-400 mb-6">{error || 'This model may have been deleted or is not accessible.'}</p>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-white transition"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-gray-800 rounded-lg transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{model.name}</h1>
                        {model.description && (
                            <p className="text-sm text-gray-400">{model.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={copyShareLink}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                    >
                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                    <a
                        href={model.modelUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm font-medium transition"
                    >
                        <Download size={16} /> Download {model.format.toUpperCase()}
                    </a>
                </div>
            </div>

            {/* Viewer */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PlayCanvasViewer
                        modelUrl={model.modelUrl}
                        format={model.format}
                        className="aspect-[16/10] w-full"
                    />
                </div>

                {/* Sidebar info */}
                <div className="space-y-6">
                    {/* Original image */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Original Image</h3>
                        <img
                            src={model.originalImageUrl}
                            alt="Original"
                            className="w-full rounded-xl bg-gray-800 object-contain max-h-48"
                        />
                    </div>

                    {/* Model details */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Model Details</h3>
                        <div className="space-y-2">
                            <DetailRow label="Format" value={model.format.toUpperCase()} />
                            <DetailRow
                                label="File Size"
                                value={formatBytes(model.fileSizeBytes)}
                            />
                            {model.vertexCount && (
                                <DetailRow
                                    label="Vertices"
                                    value={model.vertexCount.toLocaleString()}
                                />
                            )}
                            {model.faceCount && (
                                <DetailRow
                                    label="Faces"
                                    value={model.faceCount.toLocaleString()}
                                />
                            )}
                            <DetailRow
                                label="Created"
                                value={new Date(model.createdAt).toLocaleDateString()}
                            />
                            <DetailRow
                                label="Visibility"
                                value={model.isPublic ? 'Public' : 'Private'}
                            />
                        </div>
                    </div>

                    {/* Copy embed code */}
                    {model.isPublic && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Embed</h3>
                            <div className="p-3 bg-gray-800 rounded-lg">
                                <code className="text-xs text-gray-300 break-all">
                                    {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/viewer/${model.id}?embed=true" width="640" height="480"></iframe>`}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `<iframe src="${window.location.origin}/viewer/${model.id}?embed=true" width="640" height="480"></iframe>`
                                        );
                                    }}
                                    className="mt-2 flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
                                >
                                    <Copy size={12} /> Copy embed code
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm text-white font-medium">{value}</span>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}
