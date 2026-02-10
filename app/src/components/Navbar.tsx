'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Box, LogOut, User, CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Box className="w-7 h-7 text-brand" />
                        <span className="text-xl font-bold text-foreground">
                            Render<span className="text-primary">Forge</span>
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
                            Pricing
                        </Link>
                        {session && (
                            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Auth + Mobile toggle */}
                    <div className="flex items-center gap-3">
                        {status === 'loading' && (
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        )}

                        {status === 'unauthenticated' && (
                            <Button onClick={() => signIn()} variant="brand" size="sm">
                                Sign In
                            </Button>
                        )}

                        {status === 'authenticated' && session && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 focus:outline-none">
                                        {session.user.image ? (
                                            <img
                                                src={session.user.image}
                                                alt=""
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-brand-foreground text-sm font-medium">
                                                {session.user.name?.[0] || '?'}
                                            </div>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <p className="font-medium truncate">{session.user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="flex items-center gap-2">
                                            <User size={16} /> Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/pricing" className="flex items-center gap-2">
                                            <CreditCard size={16} /> Subscription
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                                        <LogOut size={16} className="mr-2" /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 hover:bg-accent rounded-md transition"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile nav drawer */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-border py-4 space-y-2">
                        <Link
                            href="/pricing"
                            className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition"
                            onClick={() => setMobileOpen(false)}
                        >
                            Pricing
                        </Link>
                        {session && (
                            <Link
                                href="/dashboard"
                                className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition"
                                onClick={() => setMobileOpen(false)}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
