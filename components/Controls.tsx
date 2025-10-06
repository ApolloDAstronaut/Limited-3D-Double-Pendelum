import React from 'react';
import type { PendulumParameters } from '../types';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({ label, value, min, max, step, onChange, unit }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center text-sm">
        <label className="font-medium text-gray-300">{label}</label>
        <span className="px-2 py-0.5 bg-gray-700 rounded-md text-teal-300 font-mono text-xs">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-teal-400"
      />
    </div>
  );
};

// Fix: Update ControlsProps to correctly type 'params' and 'setParams'
// to align with the state shape in App.tsx, which includes a 'key' for resets.
interface ControlsProps {
  params: PendulumParameters & { key: number };
  setParams: React.Dispatch<React.SetStateAction<PendulumParameters & { key: number }>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  resetSimulation: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ params, setParams, isRunning, setIsRunning, resetSimulation }) => {
  const handleParamChange = (key: keyof PendulumParameters, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-full p-6 bg-gray-800/50 backdrop-blur-md border-l border-gray-700/50 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Simulation Controls</h2>
      <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Physics</h3>
            <div className="space-y-4 pl-2 border-l-2 border-teal-500/30">
                <ParameterSlider label="Gravity (g)" value={params.g} min={1} max={30} step={0.1} onChange={v => handleParamChange('g', v)} unit="m/s²" />
                <ParameterSlider label="Mass 1 (m1)" value={params.m1} min={1} max={50} step={1} onChange={v => handleParamChange('m1', v)} unit="kg" />
                <ParameterSlider label="Length 1 (l1)" value={params.l1} min={10} max={150} step={1} onChange={v => handleParamChange('l1', v)} unit="m" />
                <ParameterSlider label="Mass 2 (m2)" value={params.m2} min={1} max={50} step={1} onChange={v => handleParamChange('m2', v)} unit="kg" />
                <ParameterSlider label="Length 2 (l2)" value={params.l2} min={10} max={150} step={1} onChange={v => handleParamChange('l2', v)} unit="m" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Initial State</h3>
             <div className="space-y-4 pl-2 border-l-2 border-purple-500/30">
                <ParameterSlider label="Theta 1 (θ₁)" value={params.initialTheta1} min={0} max={180} step={1} onChange={v => handleParamChange('initialTheta1', v)} unit="°" />
                <ParameterSlider label="Phi 1 (φ₁)" value={params.initialPhi1} min={0} max={360} step={1} onChange={v => handleParamChange('initialPhi1', v)} unit="°" />
                <ParameterSlider label="Theta 2 (θ₂)" value={params.initialTheta2} min={0} max={180} step={1} onChange={v => handleParamChange('initialTheta2', v)} unit="°" />
                <ParameterSlider label="Phi 2 (φ₂)" value={params.initialPhi2} min={0} max={360} step={1} onChange={v => handleParamChange('initialPhi2', v)} unit="°" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-3">Visuals</h3>
            <div className="space-y-4 pl-2 border-l-2 border-gray-500/30">
                <ParameterSlider label="Trail Length" value={params.trailLength} min={50} max={2000} step={50} onChange={v => handleParamChange('trailLength', v)} />
            </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors duration-200"
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={resetSimulation}
            className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};