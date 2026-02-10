import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

// POST /api/stripe/portal — Open Stripe customer billing portal
export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user?.stripeCustomerId) {
        return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard`
    });

    return NextResponse.json({ url: portalSession.url });
}
