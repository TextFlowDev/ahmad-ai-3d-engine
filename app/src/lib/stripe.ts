import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
    typescript: true
});

export function getPlanFromPriceId(priceId: string): string {
    if (priceId === process.env.STRIPE_PRICE_STARTER) return 'STARTER';
    if (priceId === process.env.STRIPE_PRICE_PRO) return 'PRO';
    if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'ENTERPRISE';
    return 'FREE';
}

export function getPriceIdFromPlan(plan: string): string | null {
    switch (plan) {
    case 'STARTER':
        return process.env.STRIPE_PRICE_STARTER || null;
    case 'PRO':
        return process.env.STRIPE_PRICE_PRO || null;
    case 'ENTERPRISE':
        return process.env.STRIPE_PRICE_ENTERPRISE || null;
    default:
        return null;
    }
}
