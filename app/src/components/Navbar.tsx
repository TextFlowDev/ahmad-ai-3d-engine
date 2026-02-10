'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Box, LogOut, User, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Box className="w-7 h-7 text-brand-500" />
                        <span className="text-xl font-bold text-white">
                            Render<span className="text-brand-400">Forge</span>
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition">
                            Pricing
                        </Link>
                        {session && (
                            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-3">
                        {status === 'loading' && (
                            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                        )}

                        {status === 'unauthenticated' && (
                            <button
                                onClick={() => signIn()}
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm font-medium text-white transition"
                            >
                                Sign In
                            </button>
                        )}

                        {status === 'authenticated' && session && (
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2"
                                >
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt=""
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
                                            {session.user.name?.[0] || '?'}
                                        </div>
                                    )}
                                </button>

                                {menuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0"
                                            onClick={() => setMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-2">
                                            <div className="px-4 py-2 border-b border-gray-700">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {session.user.name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {session.user.email}
                                                </p>
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <User size={16} /> Dashboard
                                            </Link>
                                            <Link
                                                href="/pricing"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <CreditCard size={16} /> Subscription
                                            </Link>
                                            <button
                                                onClick={() => signOut()}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
