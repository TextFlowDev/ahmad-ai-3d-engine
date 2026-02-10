'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { BarChart3, Package, Zap } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import ConversionForm from '@/components/ConversionForm';
import JobStatus from '@/components/JobStatus';
import ModelGallery from '@/components/ModelGallery';
import { useJobPolling } from '@/hooks/useJobPolling';
import { PLANS } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Plan } from '@prisma/client';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<string>('raster');
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [converting, setConverting] = useState(false);
    const [models, setModels] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);

    const { job: activeJob } = useJobPolling(activeJobId);

    const userPlan = (session?.user as any)?.plan || 'FREE';
    const planConfig = PLANS[userPlan as Plan];

    if (status === 'unauthenticated') {
        redirect('/api/auth/signin');
    }

    const fetchModels = useCallback(async () => {
        try {
            const res = await fetch('/api/jobs?limit=50');
            if (res.ok) {
                const data = await res.json();
                setJobs(data.jobs);
                const completed = data.jobs
                    .filter((j: any) => j.model)
                    .map((j: any) => j.model);
                setModels(completed);
            }
        } catch {
            // Silently fail
        }
    }, []);

    useEffect(() => {
        if (session) fetchModels();
    }, [session, fetchModels]);

    useEffect(() => {
        if (activeJob?.status === 'COMPLETED') {
            fetchModels();
        }
    }, [activeJob?.status, fetchModels]);

    const handleFileSelected = (file: File, type: string) => {
        setSelectedFile(file);
        setFileType(type);
    };

    const handleConvert = async (options: { quality: string; format: string; textured: boolean; aiProvider: string }) => {
        if (!selectedFile) return;

        setConverting(true);
        try {
            const res = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: selectedFile.name,
                    fileType,
                    contentType: selectedFile.type,
                    ...options
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Failed to start conversion');
                return;
            }

            const { jobId, uploadUrl } = await res.json();

            await fetch(uploadUrl, {
                method: 'PUT',
                body: selectedFile,
                headers: { 'Content-Type': selectedFile.type }
            });

            setActiveJobId(jobId);
        } catch (err) {
            alert('Something went wrong. Please try again.');
        } finally {
            setConverting(false);
        }
    };

    const handleDeleteModel = async (id: string) => {
        const res = await fetch(`/api/models/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setModels(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleTogglePublic = async (id: string, isPublic: boolean) => {
        const res = await fetch(`/api/models/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublic })
        });
        if (res.ok) {
            setModels(prev => prev.map(m => m.id === id ? { ...m, isPublic } : m));
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Header stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard
                    icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    label="Plan"
                    value={planConfig.name}
                />
                <StatCard
                    icon={<BarChart3 className="w-5 h-5 text-primary" />}
                    label="Conversions this month"
                    value={`-- / ${planConfig.monthlyConversions}`}
                />
                <StatCard
                    icon={<Package className="w-5 h-5 text-green-400" />}
                    label="Total models"
                    value={models.length.toString()}
                />
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
                {/* Left: Upload & options */}
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold">New Conversion</h2>
                    <UploadZone
                        onFileSelected={handleFileSelected}
                        maxSizeMB={planConfig.maxFileSize}
                    />
                    {selectedFile && (
                        <ConversionForm
                            onSubmit={handleConvert}
                            loading={converting}
                            plan={userPlan}
                        />
                    )}
                </div>

                {/* Right: Active job status */}
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Status</h2>
                    {activeJob ? (
                        <JobStatus
                            status={activeJob.status}
                            progress={activeJob.progress}
                            errorMessage={activeJob.errorMessage}
                        />
                    ) : (
                        <Card className="p-6 md:p-8 text-center">
                            <p className="text-muted-foreground">
                                Upload an image and start a conversion to see progress here
                            </p>
                        </Card>
                    )}

                    {/* Recent jobs */}
                    {jobs.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Recent Jobs</h3>
                            <div className="space-y-2">
                                {jobs.slice(0, 5).map((job: any) => (
                                    <div
                                        key={job.id}
                                        className="flex items-center justify-between p-3 bg-card rounded-lg border border-border text-sm"
                                    >
                                        <span className="text-foreground/80 truncate mr-3">
                                            {job.inputFileName}
                                        </span>
                                        <Badge variant={
                                            job.status === 'COMPLETED' ? 'default' :
                                                job.status === 'FAILED' ? 'destructive' :
                                                    'secondary'
                                        } className="shrink-0 text-xs">
                                            {job.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Model gallery */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your 3D Models</h2>
                <ModelGallery
                    models={models}
                    onDelete={handleDeleteModel}
                    onTogglePublic={handleTogglePublic}
                />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Card className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="p-2 bg-muted rounded-lg">{icon}</div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base sm:text-lg font-semibold">{value}</p>
            </div>
        </Card>
    );
}
