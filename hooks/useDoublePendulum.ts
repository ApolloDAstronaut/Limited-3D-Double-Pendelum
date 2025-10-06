import { useState, useEffect, useCallback, useRef } from 'react';
import type { PendulumParameters, PendulumState, Vector3 } from '../types';

// --- Vector Math Utilities ---
const V3 = {
  add: (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  sub: (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  scale: (a: Vector3, s: number): Vector3 => ({ x: a.x * s, y: a.y * s, z: a.z * s }),
  magnitude: (a: Vector3): number => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z),
  normalize: (a: Vector3): Vector3 => {
    const mag = V3.magnitude(a);
    return mag > 0 ? V3.scale(a, 1 / mag) : { x: 0, y: 0, z: 0 };
  },
};

const degToRad = (deg: number) => deg * (Math.PI / 180);

const createInitialState = (params: PendulumParameters): PendulumState => {
  const { l1, l2, initialTheta1, initialPhi1, initialTheta2, initialPhi2 } = params;

  const t1 = degToRad(initialTheta1);
  const p1 = degToRad(initialPhi1);
  const t2 = degToRad(initialTheta2);
  const p2 = degToRad(initialPhi2);

  const p1_pos: Vector3 = {
    x: l1 * Math.sin(t1) * Math.cos(p1),
    y: l1 * Math.sin(t1) * Math.sin(p1),
    z: -l1 * Math.cos(t1),
  };

  const p2_pos: Vector3 = {
    x: p1_pos.x + l2 * Math.sin(t2) * Math.cos(p2),
    y: p1_pos.y + l2 * Math.sin(t2) * Math.sin(p2),
    z: p1_pos.z - l2 * Math.cos(t2),
  };

  return {
    p1: p1_pos,
    p2: p2_pos,
    trail: [p2_pos],
    key: Date.now(),
  };
};

// Fix: Update params type to include 'key' property for resetting simulation
export const useDoublePendulum = (params: PendulumParameters & { key: number }, isRunning: boolean) => {
  const [state, setState] = useState(() => createInitialState(params));
  const p1_old = useRef<Vector3>(state.p1);
  const p2_old = useRef<Vector3>(state.p2);

  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(performance.now());
  const dt = 1 / 60.0; // Fixed timestep for stability

  const simulationStep = useCallback(() => {
    setState(currentState => {
      let { p1, p2, trail } = currentState;
      const gravity: Vector3 = { x: 0, y: 0, z: -params.g };

      // Verlet integration
      const p1_temp = V3.add(V3.sub(V3.scale(p1, 2), p1_old.current), V3.scale(gravity, dt * dt));
      const p2_temp = V3.add(V3.sub(V3.scale(p2, 2), p2_old.current), V3.scale(gravity, dt * dt));

      p1_old.current = p1;
      p2_old.current = p2;
      p1 = p1_temp;
      p2 = p2_temp;

      // Constraint satisfaction (10 iterations for stability)
      for (let i = 0; i < 10; i++) {
        // Rod 1 constraint
        const rod1_dir = V3.normalize(p1);
        p1 = V3.scale(rod1_dir, params.l1);

        // Rod 2 constraint
        const rod2_vec = V3.sub(p2, p1);
        const rod2_dir = V3.normalize(rod2_vec);
        p2 = V3.add(p1, V3.scale(rod2_dir, params.l2));
      }

      // Update trail
      const newTrail = [p2, ...trail].slice(0, params.trailLength);

      return { ...currentState, p1, p2, trail: newTrail };
    });
  }, [params]);

  const animate = useCallback(() => {
    simulationStep();
    animationFrameId.current = requestAnimationFrame(animate);
  }, [simulationStep]);

  useEffect(() => {
    if (isRunning) {
      lastTime.current = performance.now();
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRunning, animate]);

  // Reset state when parameters change
  useEffect(() => {
    const newState = createInitialState(params);
    setState(newState);
    p1_old.current = newState.p1;
    p2_old.current = newState.p2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.key]);

  return state;
};