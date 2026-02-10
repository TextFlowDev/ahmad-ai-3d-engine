import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, getPlanFromPriceId } from '@/lib/stripe';
import { db } from '@/lib/db';

// POST /api/stripe/webhook — Handle Stripe webhook events
export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
    }

    switch (event.type) {
    case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && session.metadata?.userId) {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );
            await updateUserSubscription(session.metadata.userId, subscription);
        }
        break;
    }

    case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
            );
            const user = await db.user.findFirst({
                where: { stripeCustomerId: invoice.customer as string }
            });
            if (user) {
                await updateUserSubscription(user.id, subscription);
            }
        }
        break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await db.user.findFirst({
            where: { stripeCustomerId: subscription.customer as string }
        });
        if (user) {
            if (event.type === 'customer.subscription.deleted') {
                await db.user.update({
                    where: { id: user.id },
                    data: {
                        plan: 'FREE',
                        stripeSubscriptionId: null,
                        stripePriceId: null,
                        stripeCurrentPeriodEnd: null
                    }
                });
            } else {
                await updateUserSubscription(user.id, subscription);
            }
        }
        break;
    }
    }

    return NextResponse.json({ received: true });
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceId ? getPlanFromPriceId(priceId) : 'FREE';

    await db.user.update({
        where: { id: userId },
        data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId || null,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: plan as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'
        }
    });
}
