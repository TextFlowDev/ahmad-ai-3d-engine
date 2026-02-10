import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'RenderForge — 2D to 3D Model Converter',
    description: 'Transform your 2D images, drawings, and vector art into detailed 3D models with AI-powered conversion. View and export in multiple formats.',
    keywords: ['3D model', '2D to 3D', 'image to 3D', 'AI 3D generation', '3D converter']
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background text-foreground antialiased">
                <Providers>
                    <Navbar />
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
