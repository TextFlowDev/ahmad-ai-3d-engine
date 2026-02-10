'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Maximize2, Minimize2, RotateCcw, Download,
    Move, RotateCw, Scaling, Globe, Box, Magnet
} from 'lucide-react';

type GizmoMode = 'translate' | 'rotate' | 'scale' | 'none';
type CoordSpace = 'world' | 'local';

interface PlayCanvasViewerProps {
    modelUrl: string;
    format?: string;
    className?: string;
    autoRotate?: boolean;
    editable?: boolean;
    onLoad?: () => void;
    onError?: (error: string) => void;
    onTransform?: (position: number[], rotation: number[], scale: number[]) => void;
}

export default function PlayCanvasViewer({
    modelUrl,
    format = 'glb',
    className = '',
    autoRotate = true,
    editable = false,
    onLoad,
    onError,
    onTransform
}: PlayCanvasViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<any>(null);
    const gizmosRef = useRef<any>(null);
    const modelEntityRef = useRef<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gizmoMode, setGizmoMode] = useState<GizmoMode>('none');
    const [coordSpace, setCoordSpace] = useState<CoordSpace>('world');
    const [snapEnabled, setSnapEnabled] = useState(false);
    const [isDraggingGizmo, setIsDraggingGizmo] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Switch gizmo mode
    const switchGizmo = useCallback((mode: GizmoMode) => {
        const gizmos = gizmosRef.current;
        const modelEntity = modelEntityRef.current;
        if (!gizmos || !modelEntity) return;

        // Detach all
        gizmos.translate.detach();
        gizmos.rotate.detach();
        gizmos.scale.detach();

        if (mode !== 'none') {
            gizmos[mode].attach([modelEntity]);
            gizmos[mode].coordSpace = mode === 'scale' ? 'local' : coordSpace;
            gizmos[mode].snap = snapEnabled;
        }

        setGizmoMode(mode);
    }, [coordSpace, snapEnabled]);

    // Update coordSpace on active gizmo
    useEffect(() => {
        const gizmos = gizmosRef.current;
        if (!gizmos || gizmoMode === 'none' || gizmoMode === 'scale') return;
        gizmos[gizmoMode].coordSpace = coordSpace;
    }, [coordSpace, gizmoMode]);

    // Update snap on active gizmo
    useEffect(() => {
        const gizmos = gizmosRef.current;
        if (!gizmos || gizmoMode === 'none') return;
        gizmos[gizmoMode].snap = snapEnabled;
    }, [snapEnabled, gizmoMode]);

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
                keyboard: new pc.Keyboard(window),
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: true,
                    preferWebGl2: true
                }
            });

            appRef.current = app;

            app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);

            // Scene setup
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

            // Ground plane with grid
            const ground = new pc.Entity('ground');
            ground.addComponent('render', { type: 'plane' });
            ground.setLocalScale(10, 1, 10);
            const groundMat = new pc.StandardMaterial();
            groundMat.diffuse = new pc.Color(0.15, 0.15, 0.17);
            groundMat.update();
            ground.render!.meshInstances[0].material = groundMat;
            app.root.addChild(ground);

            // ─── Gizmo System ───────────────────────────────
            if (editable && pc.Gizmo) {
                const gizmoLayer = pc.Gizmo.createLayer(app);

                const translateGizmo = new pc.TranslateGizmo(camera.camera!, gizmoLayer);
                const rotateGizmo = new pc.RotateGizmo(camera.camera!, gizmoLayer);
                const scaleGizmo = new pc.ScaleGizmo(camera.camera!, gizmoLayer);

                // Configure defaults
                translateGizmo.size = 1.2;
                rotateGizmo.size = 1.2;
                scaleGizmo.size = 1.2;

                translateGizmo.snapIncrement = 0.5;
                rotateGizmo.snapIncrement = 15;
                scaleGizmo.snapIncrement = 0.25;

                // Track dragging state to disable orbit camera during gizmo use
                for (const gizmo of [translateGizmo, rotateGizmo, scaleGizmo]) {
                    gizmo.on('transform:start', () => {
                        setIsDraggingGizmo(true);
                    });
                    gizmo.on('transform:end', () => {
                        setIsDraggingGizmo(false);
                        // Report transform back to parent
                        const entity = modelEntityRef.current;
                        if (entity && onTransform) {
                            const pos = entity.getPosition();
                            const rot = entity.getEulerAngles();
                            const scl = entity.getLocalScale();
                            onTransform(
                                [pos.x, pos.y, pos.z],
                                [rot.x, rot.y, rot.z],
                                [scl.x, scl.y, scl.z]
                            );
                        }
                    });
                }

                gizmosRef.current = {
                    translate: translateGizmo,
                    rotate: rotateGizmo,
                    scale: scaleGizmo
                };

                // Keyboard shortcuts
                app.keyboard.on('keydown', (e: any) => {
                    if (e.key === pc.KEY_T) switchGizmo('translate');
                    if (e.key === pc.KEY_R) switchGizmo('rotate');
                    if (e.key === pc.KEY_S) switchGizmo('scale');
                    if (e.key === pc.KEY_ESCAPE) switchGizmo('none');
                });
            }

            app.start();

            // ─── Load 3D Model ──────────────────────────────
            setIsLoading(true);

            const assetType = format === 'glb' || format === 'gltf' ? 'container' : 'model';
            const asset = new pc.Asset('model', assetType, { url: modelUrl });

            asset.on('load', () => {
                if (destroyed) return;

                let rootEntity: any;

                if (assetType === 'container') {
                    const container = asset.resource;
                    rootEntity = container.instantiateRenderEntity();
                    app.root.addChild(rootEntity);
                } else {
                    rootEntity = new pc.Entity('loaded-model');
                    rootEntity.addComponent('model', { type: 'asset', asset });
                    app.root.addChild(rootEntity);
                }

                modelEntityRef.current = rootEntity;
                fitCameraToModel(camera, rootEntity, pc);

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

            // ─── Orbit Camera Controls ──────────────────────
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

            // Frame update — orbit camera (disabled during gizmo drag)
            let gizmoDragging = false;
            app.on('gizmo:dragging', (state: boolean) => { gizmoDragging = state; });

            app.on('update', (dt: number) => {
                if (gizmoDragging) return;

                if (autoRotate && !isDragging && gizmoMode === 'none') {
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
            // Clean up gizmos
            if (gizmosRef.current) {
                gizmosRef.current.translate.destroy();
                gizmosRef.current.rotate.destroy();
                gizmosRef.current.scale.destroy();
                gizmosRef.current = null;
            }
            if (appRef.current) {
                appRef.current.destroy();
                appRef.current = null;
            }
        };
    }, [modelUrl, format, autoRotate, editable, onLoad, onError, onTransform, switchGizmo, gizmoMode]);

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

            {/* ─── Gizmo Toolbar (only in edit mode) ─── */}
            {editable && !isLoading && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Mode buttons */}
                    <div className="flex gap-1 bg-gray-800/90 backdrop-blur rounded-lg p-1">
                        <GizmoButton
                            active={gizmoMode === 'translate'}
                            onClick={() => switchGizmo(gizmoMode === 'translate' ? 'none' : 'translate')}
                            title="Translate (T)"
                        >
                            <Move size={16} />
                        </GizmoButton>
                        <GizmoButton
                            active={gizmoMode === 'rotate'}
                            onClick={() => switchGizmo(gizmoMode === 'rotate' ? 'none' : 'rotate')}
                            title="Rotate (R)"
                        >
                            <RotateCw size={16} />
                        </GizmoButton>
                        <GizmoButton
                            active={gizmoMode === 'scale'}
                            onClick={() => switchGizmo(gizmoMode === 'scale' ? 'none' : 'scale')}
                            title="Scale (S)"
                        >
                            <Scaling size={16} />
                        </GizmoButton>
                    </div>

                    {/* Coord space toggle */}
                    {gizmoMode !== 'none' && gizmoMode !== 'scale' && (
                        <div className="flex gap-1 bg-gray-800/90 backdrop-blur rounded-lg p-1">
                            <GizmoButton
                                active={coordSpace === 'world'}
                                onClick={() => setCoordSpace('world')}
                                title="World space"
                            >
                                <Globe size={14} />
                            </GizmoButton>
                            <GizmoButton
                                active={coordSpace === 'local'}
                                onClick={() => setCoordSpace('local')}
                                title="Local space"
                            >
                                <Box size={14} />
                            </GizmoButton>
                        </div>
                    )}

                    {/* Snap toggle */}
                    {gizmoMode !== 'none' && (
                        <button
                            onClick={() => setSnapEnabled(!snapEnabled)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                                snapEnabled
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-gray-800/90 text-gray-400 hover:text-white'
                            }`}
                            title="Toggle snapping"
                        >
                            <Magnet size={14} />
                            Snap
                        </button>
                    )}

                    {/* Transform info */}
                    {isDraggingGizmo && (
                        <div className="bg-gray-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-300">
                            Transforming...
                        </div>
                    )}
                </div>
            )}

            {/* ─── Top-right controls ─── */}
            <div className="absolute top-4 right-4 flex gap-2">
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

            {/* ─── Keyboard shortcuts hint ─── */}
            {editable && gizmoMode === 'none' && !isLoading && (
                <div className="absolute bottom-4 left-4 text-xs text-gray-500">
                    T — Translate &nbsp; R — Rotate &nbsp; S — Scale &nbsp; ESC — Deselect
                </div>
            )}

            {/* Format badge */}
            <div className="absolute bottom-4 right-4">
                <span className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300 uppercase">
                    {format}
                </span>
            </div>
        </div>
    );
}

function GizmoButton({ active, onClick, title, children }: {
    active: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded-md transition ${
                active
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
        >
            {children}
        </button>
    );
}

function fitCameraToModel(camera: any, modelEntity: any, pc: any) {
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
