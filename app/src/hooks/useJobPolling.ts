'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JobResponse } from '@/types';

export function useJobPolling(jobId: string | null, interval = 3000) {
    const [job, setJob] = useState<JobResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchJob = useCallback(async () => {
        if (!jobId) return;

        try {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (!res.ok) throw new Error('Failed to fetch job status');
            const data = await res.json();
            setJob(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, [jobId]);

    useEffect(() => {
        if (!jobId) return;

        fetchJob();

        const timer = setInterval(() => {
            // Stop polling when job is done
            if (job?.status === 'COMPLETED' || job?.status === 'FAILED') return;
            fetchJob();
        }, interval);

        return () => clearInterval(timer);
    }, [jobId, interval, fetchJob, job?.status]);

    return { job, error, refetch: fetchJob };
}
