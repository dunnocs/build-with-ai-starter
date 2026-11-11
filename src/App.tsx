import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DecisionHero } from './components/DecisionHero';
import { CommuteComparator } from './components/CommuteComparator';
import { BusBoard } from './components/BusBoard';
import { CampusCarparks } from './components/CampusCarparks';
import { ParkAndRideHubs } from './components/ParkAndRideHubs';
import { SpatialTransitMap } from './components/SpatialTransitMap';
import { AiAdvisorDialog } from './components/AiAdvisorDialog';
import { LtaDataMallBridgeModal } from './components/LtaDataMallBridgeModal';
import {
  BusBoardResponse,
  CarparksResponse,
  CommuteVerdictResponse,
} from './types';
import {
  Bus,
  Car,
  Compass,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Server,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('verdict');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isLtaBridgeOpen, setIsLtaBridgeOpen] = useState<boolean>(false);

  const [busData, setBusData] = useState<BusBoardResponse | null>(null);
  const [carparkData, setCarparkData] = useState<CarparksResponse | null>(null);
  const [verdictData, setVerdictData] = useState<CommuteVerdictResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const [busRes, carparksRes, verdictRes] = await Promise.all([
        fetch('/api/bus-board?stop=04121'),
        fetch('/api/carparks'),
        fetch(`/api/commute-verdict?corridor=${selectedCorridor}`),
      ]);

      if (busRes.ok) {
        const b = await busRes.json();
        setBusData(b);
      }
      if (carparksRes.ok) {
        const c = await carparksRes.json();
        setCarparkData(c);
      }
      if (verdictRes.ok) {
        const v = await verdictRes.json();
        setVerdictData(v);
      }

      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorNotice('Connection issue retrieving live feeds. Operating with cached data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCorridor]);

  // Initial load & corridor change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 35 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, 35000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleSelectHubBus = (busNo: string) => {
    setActiveTab('buses');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Strict 3-zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchData}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      {/* Main Hero & Real-time Verdict Bar */}
      <DecisionHero
        verdictData={verdictData}
        carparkData={carparkData}
        selectedCorridor={selectedCorridor}
        setSelectedCorridor={setSelectedCorridor}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onJumpToBuses={() => setActiveTab('buses')}
        onJumpToCarparks={() => setActiveTab('campus')}
        onOpenBridgeModal={() => setIsLtaBridgeOpen(true)}
      />

      {/* Error / Offline Notice */}
      {errorNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        </div>
      )}

      {/* Viewport Workspace Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Secondary Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('verdict')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'verdict'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Decision Matrix & Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('buses')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'buses'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Stop 04121 Bus Board ({busData?.servicesCount || 15})</span>
          </button>

          <button
            onClick={() => setActiveTab('campus')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'campus'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Campus Carparks ({carparkData?.campusCarparks.length || 8})</span>
          </button>

          <button
            onClick={() => setActiveTab('park-ride')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'park-ride'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Park & Ride Feeder Hubs</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Corridor Transit Schematic</span>
          </button>

          <button
            onClick={() => setIsLtaBridgeOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 ml-auto"
          >
            <Server className="w-3.5 h-3.5" />
            <span>LTA DataMall API (/api)</span>
          </button>
        </div>

        {/* Tab 1: Verdict & Commute Comparator */}
        {activeTab === 'verdict' && (
          <div className="space-y-8">
            <CommuteComparator
              verdictData={verdictData}
              campusCarparks={carparkData?.campusCarparks || []}
              parkAndRideHubs={carparkData?.parkAndRideHubs || []}
            />

            {/* Quick Two-Column View: Campus Lots & Upcoming Feeder Buses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Campus Availability Highlight */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Campus Ring Free Lots Summary
                    </h3>
                    <p className="text-xs text-slate-500">
                      Walking radius &le; 8 mins to Stop 04121 (SMU Stamford Rd)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('campus')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    View All 8 &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(carparkData?.campusCarparks || []).slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{c.name}</div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          {c.walkingMin} min walk · ${c.hourlyRate.toFixed(2)}/hr
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
                          {c.availableLots}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono block">free lots</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Key Feeder Bus Arrivals */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Key Outlying Trunk Lines at Stop 04121
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live arrival ETAs for services connecting to Park & Ride hubs
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('buses')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Full Board &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(busData?.services || [])
                    .filter((s) => ['190', '166', '147', '16'].includes(s.serviceNo))
                    .map((s) => (
                      <div
                        key={s.serviceNo}
                        className="p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-8 bg-slate-900 text-white rounded font-mono font-bold flex items-center justify-center text-sm">
                            {s.serviceNo}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {s.corridor}
                            </div>
                            <div className="text-[11px] text-slate-500">To {s.dest}</div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {s.next ? s.next.label : '--'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Next: {s.next2 ? s.next2.label : '--'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bus Board */}
        {activeTab === 'buses' && (
          <BusBoard
            busData={busData}
            isLoading={isLoading}
            onSelectHubBus={handleSelectHubBus}
          />
        )}

        {/* Tab 3: Campus Carparks */}
        {activeTab === 'campus' && (
          <CampusCarparks carparks={carparkData?.campusCarparks || []} />
        )}

        {/* Tab 4: Park & Ride Hubs */}
        {activeTab === 'park-ride' && (
          <ParkAndRideHubs
            hubs={carparkData?.parkAndRideHubs || []}
            busData={busData}
            onSelectBus={(b) => setActiveTab('buses')}
          />
        )}

        {/* Tab 5: Spatial Transit Map */}
        {activeTab === 'map' && (
          <SpatialTransitMap
            onSelectBus={(b) => setActiveTab('buses')}
            onSelectHub={(h) => setActiveTab('park-ride')}
          />
        )}
      </main>

      {/* AI Advisor Modal */}
      <AiAdvisorDialog
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        campusLotsCount={carparkData?.summary?.campusTotalAvailable || 0}
      />

      {/* LTA DataMall Serverless Bridge Modal */}
      <LtaDataMallBridgeModal
        isOpen={isLtaBridgeOpen}
        onClose={() => setIsLtaBridgeOpen(false)}
      />

      {/* Clean Domain Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Singapore Management University (SMU) Civic Core</span>
            <span aria-hidden="true">·</span>
            <span>Stop 04121 Stamford Road</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>LTA DataMall v3 Live</span>
            <span aria-hidden="true">·</span>
            <span>Data.gov.sg Carpark API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
