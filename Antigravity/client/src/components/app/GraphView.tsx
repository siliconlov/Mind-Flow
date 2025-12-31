import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';


interface Note {
    id: string;
    title: string;
    links?: { targetId: string }[];
}

interface GraphViewProps {
    notes: Note[];
    onNodeClick?: (note: Note) => void;
}

export function GraphView({ notes, onNodeClick }: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    w: containerRef.current.offsetWidth,
                    h: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        // Small delay to ensure container is rendered
        setTimeout(updateDimensions, 100);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Transform notes to graph data
    const nodes = notes.map(note => ({
        id: note.id,
        name: note.title,
        val: (note.links?.length || 0) + 1 // Size based on connectivity
    }));

    const links = notes.flatMap(note =>
        (note.links || []).map(link => ({
            source: note.id,
            target: link.targetId
        }))
    );

    const graphData = { nodes, links };

    return (
        <div ref={containerRef} className="w-full h-full bg-background relative overflow-hidden">

            {/* Graph */}
            <ForceGraph2D
                width={dimensions.w}
                height={dimensions.h}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={() => "#6366f1"} // Primary color
                linkColor={() => "rgba(255,255,255,0.2)"}
                backgroundColor="#00000000" // Transparent
                onNodeClick={(node: any) => {
                    const originalNote = notes.find(n => n.id === node.id);
                    if (originalNote && onNodeClick) {
                        onNodeClick(originalNote);
                    }
                }}
                nodeRelSize={6}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
            />

            {/* Overlay Title */}
            <div className="absolute top-6 left-8 pointer-events-none">
                <h2 className="text-2xl font-bold text-white/20">Knowledge Graph</h2>
            </div>
        </div>
    );
}
