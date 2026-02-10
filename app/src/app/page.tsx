import Link from 'next/link';
import { ArrowRight, Box, Sparkles, Zap, Shield, Image, FileImage, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
    return (
        <div className="relative">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24 pb-12 sm:pb-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <Badge variant="outline" className="mb-6 sm:mb-8 gap-2 px-4 py-2 border-primary/20 bg-primary/5 text-primary">
                            <Sparkles size={16} />
                            AI-Powered 2D to 3D Conversion
                        </Badge>

                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                            Transform
                            <span className="text-primary"> any image </span>
                            into a 3D model
                        </h1>

                        <p className="text-base sm:text-xl text-muted-foreground mt-4 sm:mt-6 max-w-2xl mx-auto">
                            Upload your 2D drawings, photos, vector art, or raster images and get
                            detailed, production-ready 3D models in seconds. Powered by cutting-edge AI.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
                            <Button asChild variant="brand" size="lg" className="w-full sm:w-auto px-8">
                                <Link href="/dashboard">
                                    Start Converting <ArrowRight size={20} className="ml-2" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8">
                                <Link href="/pricing">
                                    View Pricing
                                </Link>
                            </Button>
                        </div>

                        {/* Supported formats */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Image size={16} /> PNG, JPG, WebP
                            </span>
                            <span className="flex items-center gap-2">
                                <FileImage size={16} /> SVG
                            </span>
                            <span className="flex items-center gap-2">
                                <Pen size={16} /> PDF Drawings
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">How it works</h2>
                    <p className="text-muted-foreground mt-3 sm:mt-4">Three simple steps to go from 2D to 3D</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <StepCard
                        number="1"
                        title="Upload your image"
                        description="Drag & drop any 2D image — photos, illustrations, sketches, vector art, or technical drawings."
                        icon={<Image className="w-8 h-8" />}
                    />
                    <StepCard
                        number="2"
                        title="AI converts to 3D"
                        description="Our AI pipeline analyzes your image and generates a detailed 3D model with textures and materials."
                        icon={<Sparkles className="w-8 h-8" />}
                    />
                    <StepCard
                        number="3"
                        title="Preview & export"
                        description="Inspect your model in our real-time 3D viewer powered by PlayCanvas. Download in GLB, glTF, OBJ, or FBX."
                        icon={<Box className="w-8 h-8" />}
                    />
                </div>
            </section>

            {/* Why us */}
            <section className="border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
                    <div className="text-center mb-8 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Why RenderForge?</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-yellow-400" />}
                            title="Lightning fast"
                            description="Get 3D models in seconds, not hours. Our optimized pipeline delivers production-quality results at speed."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-green-400" />}
                            title="Production quality"
                            description="High-poly, textured models with PBR materials. Ready for games, AR/VR, product visualization, and more."
                        />
                        <FeatureCard
                            icon={<Box className="w-6 h-6 text-primary" />}
                            title="Real-time 3D viewer"
                            description="Inspect every detail with our WebGL/WebGPU viewer powered by the PlayCanvas engine. Orbit, zoom, and explore."
                        />
                        <FeatureCard
                            icon={<Sparkles className="w-6 h-6 text-purple-400" />}
                            title="Multiple AI providers"
                            description="Choose from Meshy, TripoSR, or OpenAI backends. Each optimized for different use cases and styles."
                        />
                        <FeatureCard
                            icon={<FileImage className="w-6 h-6 text-orange-400" />}
                            title="Any input format"
                            description="Raster images (PNG, JPG), vector art (SVG), and technical drawings (PDF). We handle them all."
                        />
                        <FeatureCard
                            icon={<ArrowRight className="w-6 h-6 text-cyan-400" />}
                            title="Multiple export formats"
                            description="Export to GLB, glTF, OBJ, or FBX. Use your 3D models anywhere — Unity, Unreal, Blender, and more."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-border">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        Ready to bring your images to life?
                    </h2>
                    <p className="text-muted-foreground mt-4 text-base sm:text-lg">
                        Start with 3 free conversions. No credit card required.
                    </p>
                    <Button asChild variant="brand" size="lg" className="mt-8">
                        <Link href="/dashboard">
                            Get Started Free <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-brand" />
                        <span>RenderForge</span>
                    </div>
                    <p>Powered by PlayCanvas Engine</p>
                </div>
            </footer>
        </div>
    );
}

function StepCard({ number, title, description, icon }: {
    number: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="relative p-6 md:p-8">
            <div className="absolute -top-4 -left-2 w-10 h-10 bg-brand rounded-full flex items-center justify-center text-brand-foreground text-lg font-bold">
                {number}
            </div>
            <div className="text-primary mb-4">{icon}</div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm md:text-base">{description}</p>
        </Card>
    );
}

function FeatureCard({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="p-4 md:p-6 hover:border-muted-foreground transition">
            <div className="mb-4">{icon}</div>
            <h3 className="text-base md:text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </Card>
    );
}
