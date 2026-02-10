'use client';

import { useSession } from 'next-auth/react';
import PricingCard from '@/components/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Plan } from '@prisma/client';

export default function PricingPage() {
    const { data: session } = useSession();
    const { plan: currentPlan, loading, subscribe } = useSubscription();

    const planEntries = Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
            <div className="text-center mb-8 sm:mb-16">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    Simple, transparent pricing
                </h1>
                <p className="text-base sm:text-xl text-muted-foreground mt-3 sm:mt-4 max-w-2xl mx-auto">
                    Start free with 3 conversions per month. Scale as you grow.
                    Cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
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
            <div className="max-w-3xl mx-auto mt-12 sm:mt-24">
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-12">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="conversion">
                        <AccordionTrigger>What counts as a conversion?</AccordionTrigger>
                        <AccordionContent>
                            Each 2D image you submit for 3D conversion counts as one conversion, regardless of quality setting or output format.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="change-plan">
                        <AccordionTrigger>Can I change my plan anytime?</AccordionTrigger>
                        <AccordionContent>
                            Yes! Upgrade or downgrade at any time. When upgrading, you&apos;ll be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="image-types">
                        <AccordionTrigger>What image types are supported?</AccordionTrigger>
                        <AccordionContent>
                            We support raster images (PNG, JPG, WebP, BMP, TIFF), vector graphics (SVG), and technical drawings (PDF). For best results, use high-contrast images with a clear subject.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ownership">
                        <AccordionTrigger>Do I own the generated 3D models?</AccordionTrigger>
                        <AccordionContent>
                            Yes! All 3D models generated from your images are yours to use commercially. No attribution required.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="formats">
                        <AccordionTrigger>What export formats are available?</AccordionTrigger>
                        <AccordionContent>
                            Free and Starter plans support GLB/glTF. Pro and Enterprise plans add OBJ and FBX support. All formats include textures when the textured option is enabled.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
