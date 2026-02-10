'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, FileImage, Pen } from 'lucide-react';

interface UploadZoneProps {
    onFileSelected: (file: File, fileType: string) => void;
    maxSizeMB?: number;
    disabled?: boolean;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg'],
    'image/bmp': ['.bmp'],
    'image/tiff': ['.tiff', '.tif'],
    'application/pdf': ['.pdf']
};

function detectFileType(file: File): string {
    if (file.type === 'image/svg+xml') return 'vector';
    if (file.type === 'application/pdf') return 'drawing';
    return 'raster';
}

export default function UploadZone({
    onFileSelected,
    maxSizeMB = 25,
    disabled = false
}: UploadZoneProps) {
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        const fileType = detectFileType(file);
        onFileSelected(file, fileType);
    }, [onFileSelected]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxFiles: 1,
        maxSize: maxSizeMB * 1024 * 1024,
        disabled
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragActive
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-gray-600 hover:border-gray-400 bg-gray-800/50'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 rounded-lg object-contain"
                        />
                        <p className="text-sm text-gray-400">
                            Drop a new image to replace, or click to change
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white">
                                {isDragActive ? 'Drop your image here' : 'Upload your 2D image'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Drag & drop or click to browse
                            </p>
                        </div>
                        <div className="flex gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Image size={14} /> Raster (PNG, JPG, WebP)
                            </span>
                            <span className="flex items-center gap-1">
                                <FileImage size={14} /> Vector (SVG)
                            </span>
                            <span className="flex items-center gap-1">
                                <Pen size={14} /> Drawing (PDF)
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">
                            Max file size: {maxSizeMB}MB
                        </p>
                    </div>
                )}
            </div>

            {fileRejections.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">
                        {fileRejections[0].errors[0]?.message || 'File not accepted'}
                    </p>
                </div>
            )}
        </div>
    );
}
