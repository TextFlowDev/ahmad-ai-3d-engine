'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingCardProps {
    name: string;
    description: string;
    price: number;
    features: string[];
    isCurrentPlan?: boolean;
    isPopular?: boolean;
    onSelect: () => void;
    loading?: boolean;
}

export default function PricingCard({
    name,
    description,
    price,
    features,
    isCurrentPlan = false,
    isPopular = false,
    onSelect,
    loading = false
}: PricingCardProps) {
    return (
        <Card
            className={cn(
                'relative',
                isPopular && 'border-primary shadow-lg shadow-primary/10'
            )}
        >
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">Most Popular</Badge>
                </div>
            )}

            <CardHeader>
                <h3 className="text-xl font-bold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </CardHeader>

            <CardContent>
                <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${price}</span>
                    {price > 0 && <span className="text-muted-foreground ml-1">/month</span>}
                </div>

                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={onSelect}
                    disabled={isCurrentPlan || loading}
                    variant={isCurrentPlan ? 'secondary' : isPopular ? 'brand' : 'outline'}
                    className="w-full"
                >
                    {isCurrentPlan
                        ? 'Current Plan'
                        : loading
                            ? 'Redirecting...'
                            : price === 0
                                ? 'Get Started'
                                : 'Subscribe'}
                </Button>
            </CardFooter>
        </Card>
    );
}
