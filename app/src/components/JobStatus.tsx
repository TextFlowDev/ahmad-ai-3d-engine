'use client';

import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface JobStatusProps {
    status: string;
    progress: number;
    errorMessage?: string;
    className?: string;
}

const statusConfig: Record<string, {
    icon: typeof Clock;
    label: string;
    color: string;
    bgColor: string;
}> = {
    PENDING: {
        icon: Clock,
        label: 'Queued',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10'
    },
    PROCESSING: {
        icon: Loader2,
        label: 'Converting',
        color: 'text-brand-400',
        bgColor: 'bg-brand-400/10'
    },
    COMPLETED: {
        icon: CheckCircle2,
        label: 'Completed',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10'
    },
    FAILED: {
        icon: XCircle,
        label: 'Failed',
        color: 'text-red-400',
        bgColor: 'bg-red-400/10'
    }
};

export default function JobStatus({ status, progress, errorMessage, className = '' }: JobStatusProps) {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
        <div className={`rounded-xl p-6 ${config.bgColor} ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <Icon
                    className={`w-6 h-6 ${config.color} ${status === 'PROCESSING' ? 'animate-spin' : ''}`}
                />
                <span className={`font-semibold ${config.color}`}>
                    {config.label}
                </span>
            </div>

            {status === 'PROCESSING' && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-brand-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 text-right">{progress}%</p>
                </div>
            )}

            {status === 'FAILED' && errorMessage && (
                <p className="text-sm text-red-300 mt-2">{errorMessage}</p>
            )}

            {status === 'PENDING' && (
                <p className="text-sm text-gray-400">
                    Your conversion is in the queue and will start shortly...
                </p>
            )}
        </div>
    );
}
