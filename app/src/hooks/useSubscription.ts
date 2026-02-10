'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function useSubscription() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const subscribe = async (plan: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Subscription error:', err);
        } finally {
            setLoading(false);
        }
    };

    const manageBilling = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Billing portal error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        plan: (session?.user as any)?.plan || 'FREE',
        loading,
        subscribe,
        manageBilling
    };
}
