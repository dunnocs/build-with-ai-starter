import React, { useState } from 'react';
import { Bus, MapPin, Navigation, ArrowRight } from 'lucide-react';

interface SpatialTransitMapProps {
  onSelectBus: (busNo: string) => void;
  onSelectHub: (hubId: string) => void;
}

const NODES = [
  {
    id: 'north-west',
    label: 'Bukit Panjang Integrated Hub',
    bus: '190',
    expressway: 'BKE / Stevens Rd',
    time: '22 min',
    lots: '285 lots',
    x: 22,
    y: 20,
    corridor: 'North-West Corridor',
  },
  {
    id: 'north',
    label: 'Bishan Central Multistorey',
    bus: '166',
    expressway: 'Thomson Rd / CTE',
    time: '24 min',
    lots: '198 lots',
    x: 50,
    y: 18,
    corridor: 'North Corridor',
  },
  {
    id: 'north-east',
    label: 'Serangoon Central (NEX)',
    bus: '147',
    expressway: 'Upper Serangoon / KPE',
    time: '21 min',
    lots: '230 lots',
    x: 78,
    y: 22,
    corridor: 'North-East Corridor',
  },
  {
    id: 'west',
    label: 'Holland Drive / Commonwealth',
    bus: '106',
    expressway: 'AYE / Holland Rd',
    time: '20 min',
    lots: '192 lots',
    x: 20,
    y: 70,
    corridor: 'West Corridor',
  },
  {
    id: 'east',
    label: 'Old Airport Road / Mountbatten',
    bus: '16',
    expressway: 'ECP / Nicoll Hwy',
    time: '16 min',
    lots: '175 lots',
    x: 82,
    y: 68,
    corridor: 'East Coast Corridor',
  },
];

export const SpatialTransitMap: React.FC<SpatialTransitMapProps> = ({
  onSelectBus,
  onSelectHub,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('north-west');

  const active = NODES.find((n) => n.id === selectedNode) || NODES[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Singapore Park & Ride Transit Corridors into Stop 04121
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual map of radial expressways feeding directly into SMU Stamford Road.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          <span>Focal Hub: Bus Stop 04121 (SMU Stamford Rd)</span>
        </div>
      </div>

      {/* Schematic Interactive Map Canvas */}
      <div className="relative w-full h-[380px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-4">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Central Core: Bus Stop 04121 (SMU Stamford Road) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 backdrop-blur-sm p-1">
            <Bus className="w-6 h-6 text-emerald-400 mb-0.5" />
            <span className="text-[10px] font-extrabold text-white font-mono leading-none">
              STOP 04121
            </span>
            <span className="text-[8px] text-emerald-300 font-semibold leading-tight mt-0.5">
              SMU CAMPUS
            </span>
          </div>
          <div className="mt-2 text-xs font-bold text-white whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
            Civic District Core
          </div>
        </div>

        {/* Connecting SVG Vector Lines from Outlying Hubs to Core */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {NODES.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <g key={node.id}>
                <line
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2="50%"
                  y2="50%"
                  stroke={isSelected ? '#10b981' : '#334155'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  strokeDasharray={isSelected ? 'none' : '4 4'}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Outlying Interactive Hub Nodes */}
        {NODES.map((node) => {
          const isSelected = selectedNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              style={{ top: `${node.y}%`, left: `${node.x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Bus {node.bus}</span>
              </div>
              <div className="text-xs font-bold text-white whitespace-nowrap mt-0.5">
                {node.label}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {node.time} · {node.lots}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Corridor Insight Card */}
      {active && (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              {active.corridor} · Feeder via {active.expressway}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {active.label} &rarr; Stop 04121 (SMU Stamford Rd)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Drive into this fringe hub, park at standard HDB rates ($1.20/hr), and catch direct trunk <strong>Bus {active.bus}</strong>. Estimated transit ride is ~{active.time}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectBus(active.bus)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Track Bus {active.bus} Arrivals</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
