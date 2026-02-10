'use client';

import { useState } from 'react';
import { Eye, Download, Trash2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Model {
    id: string;
    name: string;
    thumbnailUrl?: string;
    modelUrl: string;
    format: string;
    fileSizeBytes: number;
    isPublic: boolean;
    createdAt: string;
}

interface ModelGalleryProps {
    models: Model[];
    onDelete?: (id: string) => void;
    onTogglePublic?: (id: string, isPublic: boolean) => void;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ModelGallery({ models, onDelete, onTogglePublic }: ModelGalleryProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this model?')) return;
        setDeletingId(id);
        onDelete?.(id);
        setDeletingId(null);
    };

    if (models.length === 0) {
        return (
            <div className="text-center py-12 md:py-16">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">No models yet</h3>
                <p className="text-sm text-muted-foreground/60 mt-1">
                    Upload a 2D image to generate your first 3D model
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {models.map((model) => (
                <Card
                    key={model.id}
                    className="group overflow-hidden hover:border-muted-foreground transition"
                >
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-background">
                        {model.thumbnailUrl ? (
                            <img
                                src={model.thumbnailUrl}
                                alt={model.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Eye size={48} />
                            </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                            <Button asChild size="icon" variant="brand" className="rounded-full">
                                <Link href={`/viewer/${model.id}`}>
                                    <Eye size={20} />
                                </Link>
                            </Button>
                            <Button asChild size="icon" variant="secondary" className="rounded-full">
                                <a href={model.modelUrl} download>
                                    <Download size={20} />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <h3 className="font-medium text-foreground truncate">{model.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatBytes(model.fileSizeBytes)} &middot; {model.format.toUpperCase()} &middot; {timeAgo(model.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => onTogglePublic?.(model.id, !model.isPublic)}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-1 rounded text-xs transition',
                                    model.isPublic
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {model.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                                {model.isPublic ? 'Public' : 'Private'}
                            </button>

                            <div className="flex-1" />

                            <button
                                onClick={() => handleDelete(model.id)}
                                disabled={deletingId === model.id}
                                className="p-1 text-muted-foreground hover:text-destructive transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
