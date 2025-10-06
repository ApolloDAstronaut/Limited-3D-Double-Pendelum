
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PendulumState, Vector3 } from '../types';

interface SimulationProps {
  state: PendulumState;
  rotation: { rotX: number; rotY: number };
  setRotation: React.Dispatch<React.SetStateAction<{ rotX: number; rotY: number }>>;
}

const FOV = 400;

export const Simulation: React.FC<SimulationProps> = ({ state, rotation, setRotation }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 800, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleResize = useCallback(() => {
    if (svgRef.current) {
      const parent = svgRef.current.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const minDim = Math.min(rect.width, rect.height);
        setSize({ width: minDim, height: minDim });
      }
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const project = useCallback((point: Vector3): { x: number; y: number; scale: number } => {
    const { rotX, rotY } = rotation;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Rotate around Y axis
    let x1 = point.x * cosY + point.z * sinY;
    let z1 = -point.x * sinY + point.z * cosY;

    // Rotate around X axis
    let y2 = point.y * cosX - z1 * sinX;
    let z2 = point.y * sinX + z1 * cosX;

    const scale = FOV / (FOV + z2 + 200);
    const sx = x1 * scale;
    const sy = y2 * scale;

    return { x: size.width / 2 + sx, y: size.height / 2 - sy, scale };
  }, [rotation, size]);


  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation(prev => ({
      rotY: prev.rotY + dx * 0.005,
      rotX: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.rotX - dy * 0.005)),
    }));
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const origin = { x: 0, y: 0, z: 0 };
  const pOrigin = project(origin);
  const p1 = project(state.p1);
  const p2 = project(state.p2);
  const trailPoints = state.trail.map(project).map(p => `${p.x},${p.y}`).join(' ');

  const bob1Radius = 10 * p1.scale;
  const bob2Radius = 15 * p2.scale;

  return (
    <div 
      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg ref={svgRef} width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
        <defs>
          <radialGradient id="bob1Gradient" cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#81e6d9" />
            <stop offset="100%" stopColor="#319795" />
          </radialGradient>
          <radialGradient id="bob2Gradient" cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#9f7aea" />
            <stop offset="100%" stopColor="#6b46c1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polyline
          points={trailPoints}
          fill="none"
          stroke="url(#trailGradient)"
          strokeWidth="2"
          strokeOpacity="0.7"
          filter="url(#glow)"
        />
         <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6b46c1" />
            <stop offset="100%" stopColor="#319795" />
        </linearGradient>

        <line x1={pOrigin.x} y1={pOrigin.y} x2={p1.x} y2={p1.y} stroke="#4a5568" strokeWidth="2" />
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#718096" strokeWidth="3" />

        <circle cx={pOrigin.x} cy={pOrigin.y} r="5" fill="#a0aec0" />
        <circle cx={p1.x} cy={p1.y} r={bob1Radius} fill="url(#bob1Gradient)" />
        <circle cx={p2.x} cy={p2.y} r={bob2Radius} fill="url(#bob2Gradient)" />
      </svg>
    </div>
  );
};
