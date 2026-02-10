'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, Download } from 'lucide-react';

interface PlayCanvasViewerProps {
    modelUrl: string;
    format?: string;
    className?: string;
    autoRotate?: boolean;
    onLoad?: () => void;
    onError?: (error: string) => void;
}

export default function PlayCanvasViewer({
    modelUrl,
    format = 'glb',
    className = '',
    autoRotate = true,
    onLoad,
    onError
}: PlayCanvasViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !modelUrl) return;

        let destroyed = false;

        async function initPlayCanvas() {
            const pc = await import('playcanvas');
            if (destroyed) return;

            const canvas = canvasRef.current!;
            const app = new pc.Application(canvas, {
                mouse: new pc.Mouse(canvas),
                touch: new pc.TouchDevice(canvas),
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: true,
                    preferWebGl2: true
                }
            });

            appRef.current = app;

            app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);

            // Set up scene
            app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);
            app.scene.gammaCorrection = pc.GAMMA_SRGB;
            app.scene.toneMapping = pc.TONEMAP_ACES;
            app.scene.skyboxMip = 2;

            // Camera
            const camera = new pc.Entity('camera');
            camera.addComponent('camera', {
                clearColor: new pc.Color(0.12, 0.12, 0.14, 1),
                fov: 45,
                nearClip: 0.01,
                farClip: 1000
            });
            camera.setPosition(0, 1.5, 4);
            camera.lookAt(0, 0.5, 0);
            app.root.addChild(camera);

            // Lights
            const directionalLight = new pc.Entity('directional');
            directionalLight.addComponent('light', {
                type: 'directional',
                color: new pc.Color(1, 0.95, 0.9),
                intensity: 1.2,
                castShadows: true,
                shadowBias: 0.2,
                shadowDistance: 16,
                shadowResolution: 2048
            });
            directionalLight.setEulerAngles(45, 135, 0);
            app.root.addChild(directionalLight);

            const fillLight = new pc.Entity('fill');
            fillLight.addComponent('light', {
                type: 'directional',
                color: new pc.Color(0.6, 0.7, 1),
                intensity: 0.4
            });
            fillLight.setEulerAngles(-30, -45, 0);
            app.root.addChild(fillLight);

            // Ground plane
            const ground = new pc.Entity('ground');
            ground.addComponent('render', { type: 'plane' });
            ground.setLocalScale(10, 1, 10);
            const groundMat = new pc.StandardMaterial();
            groundMat.diffuse = new pc.Color(0.15, 0.15, 0.17);
            groundMat.update();
            ground.render!.meshInstances[0].material = groundMat;
            app.root.addChild(ground);

            app.start();

            // Load the 3D model
            setIsLoading(true);

            const assetType = format === 'glb' || format === 'gltf' ? 'container' : 'model';
            const asset = new pc.Asset('model', assetType, {
                url: modelUrl
            });

            asset.on('load', () => {
                if (destroyed) return;

                const modelEntity = new pc.Entity('loaded-model');

                if (assetType === 'container') {
                    const container = asset.resource;
                    modelEntity.addComponent('render', {
                        type: 'asset',
                        meshInstances: container.renders[0]?.meshInstances || []
                    });

                    // Instantiate the full model with animations
                    const instantiated = container.instantiateRenderEntity();
                    app.root.addChild(instantiated);

                    // Auto-fit camera
                    fitCameraToModel(camera, instantiated, pc);
                } else {
                    modelEntity.addComponent('model', {
                        type: 'asset',
                        asset: asset
                    });
                    app.root.addChild(modelEntity);
                    fitCameraToModel(camera, modelEntity, pc);
                }

                setIsLoading(false);
                onLoad?.();
            });

            asset.on('error', (err: string) => {
                if (destroyed) return;
                setIsLoading(false);
                onError?.(err);
            });

            app.assets.add(asset);
            app.assets.load(asset);

            // Orbit controls
            let orbitX = 45;
            let orbitY = -30;
            let orbitDistance = 4;
            let targetOrbitX = orbitX;
            let targetOrbitY = orbitY;
            let targetDistance = orbitDistance;
            let isDragging = false;
            let lastX = 0;
            let lastY = 0;

            canvas.addEventListener('mousedown', (e: MouseEvent) => {
                isDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
            });

            canvas.addEventListener('mousemove', (e: MouseEvent) => {
                if (!isDragging) return;
                targetOrbitX += (e.clientX - lastX) * 0.3;
                targetOrbitY = Math.max(-80, Math.min(80, targetOrbitY + (e.clientY - lastY) * 0.3));
                lastX = e.clientX;
                lastY = e.clientY;
            });

            canvas.addEventListener('mouseup', () => { isDragging = false; });
            canvas.addEventListener('mouseleave', () => { isDragging = false; });

            canvas.addEventListener('wheel', (e: WheelEvent) => {
                e.preventDefault();
                targetDistance = Math.max(0.5, Math.min(20, targetDistance + e.deltaY * 0.005));
            }, { passive: false });

            // Auto-rotate + orbit update
            app.on('update', (dt: number) => {
                if (autoRotate && !isDragging) {
                    targetOrbitX += dt * 10;
                }

                orbitX += (targetOrbitX - orbitX) * 0.1;
                orbitY += (targetOrbitY - orbitY) * 0.1;
                orbitDistance += (targetDistance - orbitDistance) * 0.1;

                const radX = orbitX * Math.PI / 180;
                const radY = orbitY * Math.PI / 180;

                camera.setPosition(
                    orbitDistance * Math.cos(radY) * Math.sin(radX),
                    orbitDistance * Math.sin(radY) + 1,
                    orbitDistance * Math.cos(radY) * Math.cos(radX)
                );
                camera.lookAt(0, 0.5, 0);
            });
        }

        initPlayCanvas().catch((err) => {
            onError?.(err instanceof Error ? err.message : 'Failed to initialize 3D viewer');
        });

        return () => {
            destroyed = true;
            if (appRef.current) {
                appRef.current.destroy();
                appRef.current = null;
            }
        };
    }, [modelUrl, format, autoRotate, onLoad, onError]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const resetCamera = () => {
        // Trigger re-render to reset orbit
    };

    return (
        <div ref={containerRef} className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
            <canvas ref={canvasRef} className="w-full h-full" />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 text-sm">Loading 3D model...</p>
                    </div>
                </div>
            )}

            {/* Controls overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={resetCamera}
                    className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition"
                    title="Reset camera"
                >
                    <RotateCcw size={18} />
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <a
                    href={modelUrl}
                    download
                    className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition"
                    title="Download model"
                >
                    <Download size={18} />
                </a>
            </div>

            {/* Format badge */}
            <div className="absolute bottom-4 left-4">
                <span className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300 uppercase">
                    {format}
                </span>
            </div>
        </div>
    );
}

function fitCameraToModel(camera: any, modelEntity: any, pc: any) {
    // Calculate bounding box of loaded model
    const renders = modelEntity.findComponents('render');
    if (!renders.length) return;

    const bbox = new pc.BoundingBox();
    let first = true;

    for (const render of renders) {
        for (const mi of render.meshInstances) {
            if (first) {
                bbox.copy(mi.aabb);
                first = false;
            } else {
                bbox.add(mi.aabb);
            }
        }
    }

    const center = bbox.center;
    const halfExtents = bbox.halfExtents;
    const maxDim = Math.max(halfExtents.x, halfExtents.y, halfExtents.z) * 2.5;

    camera.setPosition(
        center.x + maxDim,
        center.y + maxDim * 0.5,
        center.z + maxDim
    );
    camera.lookAt(center.x, center.y, center.z);
}
