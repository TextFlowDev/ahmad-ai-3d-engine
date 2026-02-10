'use client';

import { useState } from 'react';
import { Eye, Download, Trash2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

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
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-400">No models yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Upload a 2D image to generate your first 3D model
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
                <div
                    key={model.id}
                    className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition"
                >
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-gray-900">
                        {model.thumbnailUrl ? (
                            <img
                                src={model.thumbnailUrl}
                                alt={model.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Eye size={48} />
                            </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                            <Link
                                href={`/viewer/${model.id}`}
                                className="p-3 bg-brand-600 hover:bg-brand-500 rounded-full text-white transition"
                            >
                                <Eye size={20} />
                            </Link>
                            <a
                                href={model.modelUrl}
                                download
                                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition"
                            >
                                <Download size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <h3 className="font-medium text-white truncate">{model.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatBytes(model.fileSizeBytes)} &middot; {model.format.toUpperCase()} &middot; {timeAgo(model.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => onTogglePublic?.(model.id, !model.isPublic)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                                    model.isPublic
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                {model.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                                {model.isPublic ? 'Public' : 'Private'}
                            </button>

                            <div className="flex-1" />

                            <button
                                onClick={() => handleDelete(model.id)}
                                disabled={deletingId === model.id}
                                className="p-1 text-gray-500 hover:text-red-400 transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
