'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, FileImage, Pen } from 'lucide-react';
import { cn } from '@/lib/utils';

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
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 md:p-8 text-center cursor-pointer transition-all',
                    isDragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground bg-card/50',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 rounded-lg object-contain"
                        />
                        <p className="text-sm text-muted-foreground">
                            Drop a new image to replace, or click to change
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-base md:text-lg font-medium text-foreground">
                                {isDragActive ? 'Drop your image here' : 'Upload your 2D image'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Drag & drop or click to browse
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground/60">
                            Max file size: {maxSizeMB}MB
                        </p>
                    </div>
                )}
            </div>

            {fileRejections.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                        {fileRejections[0].errors[0]?.message || 'File not accepted'}
                    </p>
                </div>
            )}
        </div>
    );
}
