'use client';

import { useSession } from 'next-auth/react';
import PricingCard from '@/components/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/types';
import type { Plan } from '@prisma/client';

export default function PricingPage() {
    const { data: session } = useSession();
    const { plan: currentPlan, loading, subscribe } = useSubscription();

    const planEntries = Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-bold">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-gray-400 mt-4 max-w-2xl mx-auto">
                    Start free with 3 conversions per month. Scale as you grow.
                    Cancel anytime.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {planEntries.map(([key, plan]) => (
                    <PricingCard
                        key={key}
                        name={plan.name}
                        description={plan.description}
                        price={plan.monthlyPrice}
                        features={plan.features}
                        isCurrentPlan={currentPlan === key}
                        isPopular={key === 'PRO'}
                        loading={loading}
                        onSelect={() => {
                            if (key === 'FREE') {
                                window.location.href = '/dashboard';
                            } else if (!session) {
                                window.location.href = '/api/auth/signin';
                            } else {
                                subscribe(key);
                            }
                        }}
                    />
                ))}
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto mt-24">
                <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    <FaqItem
                        question="What counts as a conversion?"
                        answer="Each 2D image you submit for 3D conversion counts as one conversion, regardless of quality setting or output format."
                    />
                    <FaqItem
                        question="Can I change my plan anytime?"
                        answer="Yes! Upgrade or downgrade at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle."
                    />
                    <FaqItem
                        question="What image types are supported?"
                        answer="We support raster images (PNG, JPG, WebP, BMP, TIFF), vector graphics (SVG), and technical drawings (PDF). For best results, use high-contrast images with a clear subject."
                    />
                    <FaqItem
                        question="Do I own the generated 3D models?"
                        answer="Yes! All 3D models generated from your images are yours to use commercially. No attribution required."
                    />
                    <FaqItem
                        question="What export formats are available?"
                        answer="Free and Starter plans support GLB/glTF. Pro and Enterprise plans add OBJ and FBX support. All formats include textures when the textured option is enabled."
                    />
                </div>
            </div>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-800">
            <h3 className="font-semibold text-white mb-2">{question}</h3>
            <p className="text-sm text-gray-400">{answer}</p>
        </div>
    );
}
