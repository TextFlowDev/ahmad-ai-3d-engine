import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripe, getPriceIdFromPlan } from '@/lib/stripe';

// POST /api/stripe/checkout — Create a Stripe checkout session
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    const priceId = getPriceIdFromPlan(plan);

    if (!priceId) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email || undefined,
            name: user.name || undefined,
            metadata: { userId: user.id }
        });
        customerId = customer.id;

        await db.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId }
        });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
        metadata: { userId: user.id }
    });

    return NextResponse.json({ url: checkoutSession.url });
}
