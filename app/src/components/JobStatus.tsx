'use client';

import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
        color: 'text-primary',
        bgColor: 'bg-primary/10'
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
        color: 'text-destructive',
        bgColor: 'bg-destructive/10'
    }
};

export default function JobStatus({ status, progress, errorMessage, className }: JobStatusProps) {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
        <div className={cn('rounded-lg p-4 md:p-6', config.bgColor, className)}>
            <div className="flex items-center gap-3 mb-4">
                <Icon
                    className={cn('w-5 h-5 md:w-6 md:h-6', config.color, status === 'PROCESSING' && 'animate-spin')}
                />
                <span className={cn('font-semibold', config.color)}>
                    {config.label}
                </span>
            </div>

            {status === 'PROCESSING' && (
                <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-right">{progress}%</p>
                </div>
            )}

            {status === 'FAILED' && errorMessage && (
                <p className="text-sm text-destructive mt-2">{errorMessage}</p>
            )}

            {status === 'PENDING' && (
                <p className="text-sm text-muted-foreground">
                    Your conversion is in the queue and will start shortly...
                </p>
            )}
        </div>
    );
}
