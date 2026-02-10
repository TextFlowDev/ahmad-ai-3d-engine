import Link from 'next/link';
import { ArrowRight, Box, Sparkles, Zap, Shield, Image, FileImage, Pen } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="relative">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-sm text-brand-300 mb-8">
                            <Sparkles size={16} />
                            AI-Powered 2D to 3D Conversion
                        </div>

                        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
                            Transform
                            <span className="text-brand-400"> any image </span>
                            into a 3D model
                        </h1>

                        <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
                            Upload your 2D drawings, photos, vector art, or raster images and get
                            detailed, production-ready 3D models in seconds. Powered by cutting-edge AI.
                        </p>

                        <div className="flex items-center justify-center gap-4 mt-10">
                            <Link
                                href="/dashboard"
                                className="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold text-white transition flex items-center gap-2"
                            >
                                Start Converting <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-white transition"
                            >
                                View Pricing
                            </Link>
                        </div>

                        {/* Supported formats */}
                        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
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
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold">How it works</h2>
                    <p className="text-gray-400 mt-4">Three simple steps to go from 2D to 3D</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
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
            <section className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">Why RenderForge?</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            icon={<Box className="w-6 h-6 text-brand-400" />}
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
            <section className="border-t border-gray-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Ready to bring your images to life?
                    </h2>
                    <p className="text-gray-400 mt-4 text-lg">
                        Start with 3 free conversions. No credit card required.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold text-white transition mt-8"
                    >
                        Get Started Free <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-brand-500" />
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
        <div className="relative p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
            <div className="absolute -top-4 -left-2 w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-lg font-bold">
                {number}
            </div>
            <div className="text-brand-400 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}

function FeatureCard({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-800 hover:border-gray-700 transition">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    );
}
