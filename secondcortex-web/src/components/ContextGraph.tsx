'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as d3 from 'd3-force';

// ── Types ─────────────────────────────────────────────────────

interface SnapshotEvent {
    id: string;
    timestamp: string;
    active_file: string;
    git_branch: string | null;
    summary: string;
    entities: string[];
    relations: Array<{ source: string; target: string; relation: string }>;
}

// ── Mystery Node Styling ──────────────────────────────────────
const NODE_STYLES: Record<string, React.CSSProperties> = {
    commit: {
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '2px',
        padding: '8px 12px',
        fontSize: '10px',
        fontWeight: 400,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
    file: {
        background: 'rgba(255, 255, 255, 0.03)',
        color: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '2px',
        padding: '6px 10px',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
    },
    entity: {
        background: 'transparent',
        color: 'rgba(255,255,255,0.4)',
        border: '1px solid rgba(255,255,255,0.03)',
        borderRadius: '0px',
        padding: '4px 8px',
        fontSize: '9px',
        fontFamily: 'var(--font-mono)',
    },
    reasoning: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '4px',
        padding: '12px 16px',
        fontSize: '11px',
        fontWeight: 500,
        maxWidth: 200,
        boxShadow: '0 0 20px rgba(255,255,255,0.05)',
    },
};

interface ContextGraphProps {
    backendUrl?: string;
    pollIntervalMs?: number;
}

export default function ContextGraph({
    backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sc-backend-suhaan.azurewebsites.net',
    pollIntervalMs = 5000, // Slower polling for landing page
}: ContextGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const seenEventsRef = useRef(new Set<string>());
    const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

    const onConnect = useCallback(
        (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    // Initial dummy data for visual filler if no backend
    useEffect(() => {
        if (nodes.length === 0) {
            const initialNodes: Node[] = [
                { id: 'kernel', data: { label: 'reasoning kernel' }, position: { x: 0, y: 0 }, style: NODE_STYLES.reasoning },
                { id: 'signal-1', data: { label: 'signal extractor' }, position: { x: 100, y: 50 }, style: NODE_STYLES.commit },
                { id: 'layer-1', data: { label: 'context layer' }, position: { x: -100, y: -50 }, style: NODE_STYLES.commit },
            ];
            const initialEdges: Edge[] = [
                { id: 'e1', source: 'kernel', target: 'signal-1', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
                { id: 'e2', source: 'kernel', target: 'layer-1', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
            ];
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [nodes.length, setNodes, setEdges]);

    // Force Simulation logic
    useEffect(() => {
        if (nodes.length === 0) return;

        const simNodes = nodes.map((n) => ({ ...n, x: n.position.x, y: n.position.y }));
        const nodeIds = new Set(simNodes.map(n => n.id));
        const simLinks = edges
            .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
            .map((e) => ({ source: e.source, target: e.target, id: e.id }));

        const simulation = d3.forceSimulation(simNodes)
            .force('charge', d3.forceManyBody().strength(-150).distanceMax(500))
            .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(150).strength(0.2))
            .force('center', d3.forceCenter(0, 0).strength(0.01))
            .force('collide', d3.forceCollide().radius(90).iterations(2))
            .alpha(0.1) // Lower alpha for slower evolution
            .alphaDecay(0.01) // Very slow decay
            .velocityDecay(0.6) // More friction for "heavy" feel
            .restart();

        simulation.on('tick', () => {
            setNodes((currentNodes) =>
                currentNodes.map((n) => {
                    const simNode = simNodes.find((sn) => sn.id === n.id);
                    if (simNode) {
                        return {
                            ...n,
                            position: { x: simNode.x ?? 0, y: simNode.y ?? 0 },
                        };
                    }
                    return n;
                })
            );
        });

        simulationRef.current = simulation;
        return () => { simulation.stop(); };
    }, [nodes.length, edges.length, setNodes]);

    const processEvents = useCallback(
        (events: SnapshotEvent[]) => {
            setNodes((currentNodes) => {
                const updatedNodes = [...currentNodes];
                const newEdgesLocal: Edge[] = [];
                const nodeMap = new Map<string, Node>(updatedNodes.map(n => [n.id, n]));

                events.forEach((event) => {
                    if (seenEventsRef.current.has(event.id)) return;
                    seenEventsRef.current.add(event.id);

                    const activeFile = event.active_file || 'unknown';
                    const fileName = activeFile.split(/[/\\]/).pop() ?? activeFile;
                    const fileNodeId = `file-${fileName}`;

                    if (!nodeMap.has(fileNodeId)) {
                        const fileNode: Node = {
                            id: fileNodeId,
                            data: { label: fileName },
                            position: { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 },
                            style: NODE_STYLES.file,
                        };
                        nodeMap.set(fileNodeId, fileNode);
                        updatedNodes.push(fileNode);
                    }

                    if (event.summary) {
                        const reasoningNodeId = `reason-${event.id}`;
                        const reasoningNode: Node = {
                            id: reasoningNodeId,
                            data: { label: event.summary },
                            position: { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 },
                            style: NODE_STYLES.reasoning,
                        };
                        nodeMap.set(reasoningNodeId, reasoningNode);
                        updatedNodes.push(reasoningNode);

                        newEdgesLocal.push({
                            id: `e-${reasoningNodeId}-${fileNodeId}`,
                            source: fileNodeId,
                            target: reasoningNodeId,
                            animated: true,
                            style: { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 },
                        });
                    }
                });

                if (newEdgesLocal.length > 0) {
                    setEdges((currentEdges) => {
                        const edgeMap = new Map<string, Edge>(currentEdges.map(e => [e.id, e]));
                        newEdgesLocal.forEach(e => edgeMap.set(e.id, e));
                        return Array.from(edgeMap.values());
                    });
                }

                return updatedNodes;
            });
        },
        [setNodes, setEdges]
    );

    useEffect(() => {
        let active = true;
        const poll = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/v1/events`);
                if (res.ok) {
                    const data = await res.json();
                    if (active && Array.isArray(data.events)) processEvents(data.events);
                }
            } catch { }
        };
        const interval = setInterval(() => active && poll(), pollIntervalMs);
        poll();
        return () => { active = false; clearInterval(interval); };
    }, [backendUrl, pollIntervalMs, processEvents]);

    return (
        <div className="w-full h-full relative group">
            <ReactFlow
                nodes={nodes.map(n => ({
                    ...n,
                    style: {
                        ...n.style,
                        boxShadow: hoveredNode === n.id ? '0 0 40px rgba(255,255,255,0.4)' : 'none',
                        transform: hoveredNode === n.id ? 'scale(1.05)' : 'scale(1)',
                        animation: hoveredNode === n.id ? 'node-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                        transition: 'all 0.3s ease',
                    }
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeMouseEnter={(_, node) => setHoveredNode(node.id)}
                onNodeMouseLeave={() => setHoveredNode(null)}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.1}
                maxZoom={1.5}
                className="bg-transparent"
                proOptions={{ hideAttribution: true }}
            >
                {/* No background grid for cleaner mystery look */}
            </ReactFlow>

            {/* Cryptic floating labels on absolute position */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-[10%] left-[10%] text-[8px] uppercase tracking-[0.6em] text-white rotate-90">temporal_index</div>
                <div className="absolute bottom-[20%] right-[15%] text-[8px] uppercase tracking-[0.6em] text-white">reasoning_kernel</div>
                <div className="absolute top-[40%] right-[5%] text-[8px] uppercase tracking-[0.6em] text-white -rotate-90">signal_extractor</div>
            </div>
        </div>
    );
}
