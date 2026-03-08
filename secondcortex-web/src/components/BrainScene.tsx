"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Brain() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Create a procedural brain-like geometry by displacing icosahedron vertices
    const geometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(2.2, 5);
        const pos = geo.attributes.position;
        const vec = new THREE.Vector3();

        for (let i = 0; i < pos.count; i++) {
            vec.fromBufferAttribute(pos, i);
            const normalized = vec.clone().normalize();

            // Create brain-like folds using layered sine functions
            const fold1 = Math.sin(normalized.x * 8) * 0.12;
            const fold2 = Math.sin(normalized.y * 12 + normalized.x * 6) * 0.08;
            const fold3 = Math.cos(normalized.z * 10 + normalized.y * 4) * 0.06;
            const fold4 = Math.sin(normalized.x * 16 + normalized.z * 8) * 0.04;

            // Flatten slightly along Y axis to make it more brain-shaped (wider than tall)
            const yScale = 0.85;
            const xScale = 1.1;

            const displacement = 1 + fold1 + fold2 + fold3 + fold4;

            pos.setXYZ(
                i,
                normalized.x * displacement * 2.2 * xScale,
                normalized.y * displacement * 2.2 * yScale,
                normalized.z * displacement * 2.2
            );
        }

        geo.computeVertexNormals();
        return geo;
    }, []);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.15;
            meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshBasicMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.15}
            />
        </mesh>
    );
}

function InnerGlow() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.8, 2]} />
            <meshBasicMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.05}
            />
        </mesh>
    );
}

function FloatingParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const pts = new Float32Array(200 * 3);
        for (let i = 0; i < 200; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2.5 + Math.random() * 1.5;
            pts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
            pts[i * 3 + 2] = r * Math.cos(phi);
        }
        return pts;
    }, []);

    const bufferAttr = useMemo(() => {
        return new THREE.BufferAttribute(positions, 3);
    }, [positions]);

    useFrame((_, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y -= delta * 0.05;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <primitive attach="attributes-position" object={bufferAttr} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.03} transparent opacity={0.3} sizeAttenuation />
        </points>
    );
}

export default function BrainScene() {
    return (
        <div className="w-full h-full absolute inset-0 z-[1]">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ background: "transparent" }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <Brain />
                <InnerGlow />
                <FloatingParticles />
            </Canvas>
        </div>
    );
}
