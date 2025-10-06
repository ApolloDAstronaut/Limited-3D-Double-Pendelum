
import React, { useState, useCallback } from 'react';
import { Simulation } from './components/Simulation';
import { Controls } from './components/Controls';
import { useDoublePendulum } from './hooks/useDoublePendulum';
import type { PendulumParameters } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<PendulumParameters & { key: number }>({
    m1: 20,
    m2: 20,
    l1: 100,
    l2: 100,
    g: 9.8,
    initialTheta1: 90,
    initialPhi1: 0,
    initialTheta2: 90,
    initialPhi2: 180,
    trailLength: 500,
    key: Date.now(),
  });
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [rotation, setRotation] = useState({ rotX: -0.5, rotY: 0.5 });

  const pendulumState = useDoublePendulum(params, isRunning);

  const resetSimulation = useCallback(() => {
    setParams(prev => ({ ...prev, key: Date.now() }));
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  return (
    <main className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      <div className="flex-grow h-full w-full md:w-2/3 relative">
        <Simulation state={pendulumState} rotation={rotation} setRotation={setRotation} />
        <div className="absolute top-4 left-4 text-white p-2 rounded">
            <h1 className="text-3xl font-bold">3D Double Pendulum</h1>
            <p className="text-gray-400">Drag simulation to rotate view</p>
        </div>
      </div>
      <aside className="w-full md:w-1/3 md:max-w-sm h-full">
        <Controls
          params={params}
          setParams={setParams}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          resetSimulation={resetSimulation}
        />
      </aside>
    </main>
  );
};

export default App;
