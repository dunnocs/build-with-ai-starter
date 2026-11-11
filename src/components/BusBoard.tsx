import React, { useState } from 'react';
import { BusBoardResponse, BusService } from '../types';
import { Bus, Search, Filter, Users, Accessibility, ArrowRight, Info } from 'lucide-react';

interface BusBoardProps {
  busData: BusBoardResponse | null;
  isLoading: boolean;
  onSelectHubBus?: (serviceNo: string) => void;
}

export const BusBoard: React.FC<BusBoardProps> = ({
  busData,
  isLoading,
  onSelectHubBus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'arriving-soon' | 'double-deck'>('all');

  const services = busData?.services || [];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.serviceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.corridor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'arriving-soon') {
      return s.next && s.next.minutes <= 5;
    }
    if (filterType === 'double-deck') {
      return s.next && s.next.type === 'DD';
    }
    return true;
  });

  const getLoadBadge = (load: string) => {
    switch (load) {
      case 'SEA':
        return {
          label: 'Seats Available',
          classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        };
      case 'SDA':
        return {
          label: 'Standing Available',
          classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
        };
      case 'LSD':
        return {
          label: 'Limited Standing',
          classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
        };
      default:
        return {
          label: 'Seats Available',
          classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Electronic Board Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Live LTA DataMall Bus Telemetry · Stop 04121</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>SMU (Singapore Management University)</span>
          </h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Stamford Road</span>
            <span>·</span>
            <span>Opposite School of Economics / Social Sciences</span>
            <span>·</span>
            <span className="text-slate-300 font-mono">{services.length} Total Services</span>
          </div>
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right text-xs">
            <span className="text-slate-400 block">Feed Status</span>
            <span className="font-mono text-emerald-400 font-bold">
              {busData?.isLive ? 'CONNECTED TO LTA GATEWAY' : 'PROJECTED SCHEDULE'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bus (e.g. 190, 166, 147)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Services ({services.length})
          </button>
          <button
            onClick={() => setFilterType('arriving-soon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterType === 'arriving-soon'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Arriving &le; 5m
          </button>
          <button
            onClick={() => setFilterType('double-deck')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              filterType === 'double-deck'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Double Decker (High Capacity)
          </button>
        </div>
      </div>

      {/* Bus Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center">
          <Bus className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No bus services matching criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try clearing your search query or switching filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const nextLoad = getLoadBadge(service.next?.load || 'SEA');
            const isFeederHubBus = ['190', '166', '147', '16', '14', '106', '857'].includes(
              service.serviceNo
            );

            return (
              <div
                key={service.serviceNo}
                className={`bg-white dark:bg-slate-900 border rounded-lg p-4 transition-all shadow-sm hover:border-slate-400 dark:hover:border-slate-700 flex flex-col justify-between ${
                  isFeederHubBus
                    ? 'border-emerald-300/80 dark:border-emerald-900/60 ring-1 ring-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar: Service Number and Corridor Tag */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-13 h-11 bg-slate-900 text-white rounded-md flex items-center justify-center font-extrabold text-xl tracking-tight font-mono">
                        {service.serviceNo}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{service.operator}</span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-500 dark:text-slate-400">{service.corridor}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                          To: {service.dest}
                        </div>
                      </div>
                    </div>

                    {isFeederHubBus && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                        P&R Feeder
                      </span>
                    )}
                  </div>

                  {/* Primary Next Bus Arrival Display */}
                  <div className="bg-slate-50 dark:bg-slate-950/80 rounded-md p-3 border border-slate-200/80 dark:border-slate-800 mb-3">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Next Arrival
                      </span>
                      <div className="flex items-center gap-1">
                        {service.next?.type === 'DD' && (
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                            DOUBLE DECK
                          </span>
                        )}
                        {service.next?.feature === 'WAB' && (
                          <Accessibility className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                          {service.next ? service.next.label : '--'}
                        </span>
                        {service.next && service.next.minutes > 0 && (
                          <span className="text-xs text-slate-500 font-mono">mins away</span>
                        )}
                      </div>

                      <div className={`text-[11px] font-medium px-2 py-0.5 rounded ${nextLoad.classes}`}>
                        {nextLoad.label}
                      </div>
                    </div>
                  </div>

                  {/* Subsequent arrivals strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1 pb-2">
                    <div className="bg-slate-50 dark:bg-slate-950 px-2 py-1.5 rounded border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">2nd Bus:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 tabular-nums">
                        {service.next2 ? service.next2.label : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 px-2 py-1.5 rounded border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">3rd Bus:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 tabular-nums">
                        {service.next3 ? service.next3.label : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feeder Connections Footer */}
                {service.parkAndRideHubs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span className="truncate">Connects: {service.parkAndRideHubs.join(', ')}</span>
                    {onSelectHubBus && (
                      <button
                        onClick={() => onSelectHubBus(service.serviceNo)}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                      >
                        <span>Hub Info</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
