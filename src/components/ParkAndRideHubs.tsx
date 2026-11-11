import React from 'react';
import { CarparkItem, BusBoardResponse } from '../types';
import { Bus, MapPin, DollarSign, Clock, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react';

interface ParkAndRideHubsProps {
  hubs: CarparkItem[];
  busData: BusBoardResponse | null;
  onSelectBus: (busServiceNo: string) => void;
}

export const ParkAndRideHubs: React.FC<ParkAndRideHubsProps> = ({
  hubs,
  busData,
  onSelectBus,
}) => {
  // Find live arrival time for the direct bus serving this hub at Stop 04121
  const getBusLiveStatus = (serviceNo?: string) => {
    if (!serviceNo || !busData) return null;
    const found = busData.services.find((s) => s.serviceNo === serviceNo);
    return found ? found.next : null;
  };

  return (
    <div className="space-y-5">
      {/* Strategy Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fringe Interchanges · Avoid CBD Ramps & Peak ERP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Park Further Out: Direct Feeder Hubs into Stop 04121
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Park at high-capacity residential hubs along major Singapore expressway corridors, then board a direct trunk bus straight to SMU Stamford Road.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs">
            <span className="text-slate-400 block">Avg. Parking Rate</span>
            <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
              $1.20/hr
            </span>
            <span className="text-[10px] text-slate-400 block">HDB Standard</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs">
            <span className="text-slate-400 block">ERP Avoidance</span>
            <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
              Save $2.00–$3.50
            </span>
            <span className="text-[10px] text-slate-400 block">Per trip</span>
          </div>
        </div>
      </div>

      {/* Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hubs.map((hub) => {
          const liveBus = getBusLiveStatus(hub.directBus);
          const percentFree = Math.round((hub.availableLots / hub.totalLots) * 100);

          return (
            <div
              key={hub.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:border-emerald-400/60 dark:hover:border-emerald-600 transition-all"
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono">
                    {hub.corridor}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {hub.distanceKm} km out
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {hub.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct Line: <strong className="text-slate-800 dark:text-slate-200">Bus {hub.directBus}</strong> to Stop 04121
                </div>

                {/* Available Lots Indicator */}
                <div className="my-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-baseline justify-between mb-1">
                    <div>
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        {hub.availableLots}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {' '}free lots ({percentFree}% space)
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Cap: {hub.totalLots}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${percentFree}%` }}
                    />
                  </div>
                </div>

                {/* Direct Bus Feeder Card */}
                <div className="bg-emerald-50/50 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-900/40 rounded-md p-3 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Direct Bus {hub.directBus}</span>
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      ~{hub.busTravelTimeMin} min ride
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Next Bus At Stop 04121:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                      {liveBus ? `${liveBus.label} (${liveBus.load})` : 'Every 6-9 min'}
                    </span>
                  </div>
                </div>

                {/* Financial Savings Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Parking Rate:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                      ${hub.hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">ERP Toll Saved:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +${hub.erpSaved?.toFixed(2)} saved
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate max-w-[170px]">
                  {hub.notes}
                </span>
                <button
                  onClick={() => hub.directBus && onSelectBus(hub.directBus)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                >
                  <span>Track Bus {hub.directBus}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
