'use client';

import { Check } from 'lucide-react';

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
        <div
            className={`relative rounded-2xl p-8 border transition ${
                isPopular
                    ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10'
                    : 'border-gray-700 bg-gray-800/50'
            }`}
        >
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 rounded-full text-xs font-semibold text-white">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>

            <div className="mb-8">
                <span className="text-4xl font-bold text-white">${price}</span>
                {price > 0 && <span className="text-gray-400 ml-1">/month</span>}
            </div>

            <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>

            <button
                onClick={onSelect}
                disabled={isCurrentPlan || loading}
                className={`w-full py-3 rounded-xl font-medium transition ${
                    isCurrentPlan
                        ? 'bg-gray-700 text-gray-400 cursor-default'
                        : isPopular
                            ? 'bg-brand-600 hover:bg-brand-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                } ${loading ? 'opacity-60' : ''}`}
            >
                {isCurrentPlan ? 'Current Plan' : loading ? 'Redirecting...' : price === 0 ? 'Get Started' : 'Subscribe'}
            </button>
        </div>
    );
}
