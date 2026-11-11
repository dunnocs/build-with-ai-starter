import React, { useState } from 'react';
import { CarparkItem } from '../types';
import { MapPin, Navigation, DollarSign, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface CampusCarparksProps {
  carparks: CarparkItem[];
  onSelectCarpark?: (carpark: CarparkItem) => void;
}

export const CampusCarparks: React.FC<CampusCarparksProps> = ({
  carparks,
  onSelectCarpark,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'ample' | 'hdb-only' | 'close-walk'>('all');

  const filtered = carparks.filter((c) => {
    if (filterMode === 'ample') return c.availableLots >= 30;
    if (filterMode === 'hdb-only') return c.hourlyRate <= 2.40;
    if (filterMode === 'close-walk') return (c.walkingMin || 0) <= 3;
    return true;
  });

  const getStatusBadge = (status: string, available: number) => {
    if (available < 10) {
      return {
        label: 'CRITICAL / NEAR FULL',
        badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
        barColor: 'bg-rose-500',
      };
    }
    if (available < 25) {
      return {
        label: 'LIMITED SPACES',
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'AMPLE AVAILABLE',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      barColor: 'bg-emerald-500',
    };
  };

  return (
    <div className="space-y-5">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Near-Campus Carpark Availability (Civic District)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time lot occupancy within 8 minutes walk of Stop 04121 (SMU Stamford Road).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Campus Lots ({carparks.length})
          </button>
          <button
            onClick={() => setFilterMode('ample')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterMode === 'ample'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Ample (&ge; 30 Lots)
          </button>
          <button
            onClick={() => setFilterMode('close-walk')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterMode === 'close-walk'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            &le; 3m Walk
          </button>
          <button
            onClick={() => setFilterMode('hdb-only')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterMode === 'hdb-only'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            HDB Pricing ($2.40/hr)
          </button>
        </div>
      </div>

      {/* Carparks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((carpark) => {
          const badge = getStatusBadge(carpark.status, carpark.availableLots);
          const percentFree = Math.round((carpark.availableLots / carpark.totalLots) * 100);

          return (
            <div
              key={carpark.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{carpark.walkingMin}m walk</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {carpark.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {carpark.area} {carpark.hdbCode ? `· HDB ${carpark.hdbCode}` : ''}
                </div>

                {/* Main Lot Count Display */}
                <div className="mt-4 mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                        {carpark.availableLots}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        / {carpark.totalLots} total lots
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {carpark.occupancyRate}% full
                    </span>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${badge.barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(100, carpark.occupancyRate)}%` }}
                    />
                  </div>
                </div>

                {/* Practical Driver Details */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Parking Rate
                    </span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                      ${carpark.hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-slate-400" /> ERP Cordon
                    </span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                      {carpark.erpGantryZone || 'CBD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver note */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 italic">
                {carpark.notes}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
