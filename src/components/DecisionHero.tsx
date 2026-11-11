import React from 'react';
import { CommuteVerdictResponse, CarparksResponse } from '../types';
import { ShieldCheck, AlertTriangle, ArrowRight, Car, Bus, DollarSign, Sparkles, Server } from 'lucide-react';

interface DecisionHeroProps {
  verdictData: CommuteVerdictResponse | null;
  carparkData: CarparksResponse | null;
  selectedCorridor: string;
  setSelectedCorridor: (corridor: string) => void;
  onOpenAiAdvisor: () => void;
  onJumpToBuses: () => void;
  onJumpToCarparks: () => void;
  onOpenBridgeModal?: () => void;
}

const CORRIDORS = [
  { id: 'all', label: 'All Corridors' },
  { id: 'north-west', label: 'North-West (Bus 190)' },
  { id: 'north', label: 'North (Bus 166/857)' },
  { id: 'north-east', label: 'North-East (Bus 147)' },
  { id: 'east', label: 'East Coast (Bus 16/14)' },
  { id: 'west', label: 'West (Bus 106/7)' },
];

export const DecisionHero: React.FC<DecisionHeroProps> = ({
  verdictData,
  carparkData,
  selectedCorridor,
  setSelectedCorridor,
  onOpenAiAdvisor,
  onJumpToBuses,
  onJumpToCarparks,
  onOpenBridgeModal,
}) => {
  const isParkAndRide = verdictData?.verdict === 'PARK_AND_RIDE';
  const isDriveDirect = verdictData?.verdict === 'DRIVE_DIRECT';

  const bestCampus = verdictData?.bestCampusOption;
  const bestHub = verdictData?.bestParkAndRideOption;
  const erp = verdictData?.erpStatus;

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
      {/* Background Hero Image with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/smu_civic_district_commute_1794370227356.jpg"
          alt="Singapore Civic District and SMU Stamford Road Transit"
          className="w-full h-full object-cover opacity-25 filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Context */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
          <span>Singapore Commuter Intelligence</span>
          <span aria-hidden="true">·</span>
          <span>Stamford Rd Stop 04121</span>
          <span aria-hidden="true">·</span>
          <span>LTA DataMall & Gov Live Feed</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Verdict Narrative */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded mb-3 tracking-wide uppercase font-mono ${
                isParkAndRide
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isDriveDirect
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }">
                {isParkAndRide ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Recommendation: Park Further Out & Bus In</span>
                  </>
                ) : isDriveDirect ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Recommendation: Free Lots Free Near Campus</span>
                  </>
                ) : (
                  <>
                    <Car className="w-3.5 h-3.5" />
                    <span>Verdict: Driver Choice (Both Viable)</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
                {verdictData ? verdictData.title : 'Evaluating Live Campus Lots & Bus Arrival Headways...'}
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                {verdictData?.explanation ||
                  'Scanning 8 campus-adjacent carparks along Stamford Rd and real-time feeder bus headways into Stop 04121.'}
              </p>
            </div>

            {/* Quick Corridor Selection Buttons (Interactive Filter Control) */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400 block">
                Filter by Driving Corridor:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg max-w-fit">
                {CORRIDORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCorridor(c.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCorridor === c.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onJumpToBuses}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                <Bus className="w-4 h-4 text-emerald-400" />
                <span>View Stop 04121 Bus Board</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onJumpToCarparks}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                <Car className="w-4 h-4 text-blue-400" />
                <span>Inspect All 8 Campus Carparks</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenAiAdvisor}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>AI Commute Advisor</span>
              </button>

              {onOpenBridgeModal && (
                <button
                  onClick={onOpenBridgeModal}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-md border border-slate-700/80 transition-colors cursor-pointer"
                >
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>LTA DataMall API (/api)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics & Comparison Bento Cards */}
          <div className="lg:col-span-4 space-y-4">
            {/* Campus Status Card */}
            <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-lg shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Near-Campus Free Lots</span>
                <span className="font-mono">{carparkData?.summary?.campusStressLevel || 'LIVE'} PRESSURE</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {carparkData?.summary?.campusTotalAvailable ?? '--'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  lots available across 8 campus carparks
                </span>
              </div>
              {bestCampus && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
                  <span className="truncate max-w-[200px]">Best: {bestCampus.name}</span>
                  <span className="text-emerald-400 font-bold font-mono tabular-nums">
                    {bestCampus.availableLots} lots ({bestCampus.walkingMin}m walk)
                  </span>
                </div>
              )}
            </div>

            {/* Outlying Park & Ride Card */}
            <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-lg shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Top Park & Ride Hub</span>
                <span className="text-emerald-400 font-mono text-xs">DIRECT FEEDER</span>
              </div>
              {bestHub ? (
                <>
                  <div className="text-sm font-bold text-white truncate">{bestHub.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-300 font-mono">
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {bestHub.availableLots} free lots
                    </span>
                    <span>·</span>
                    <span>Take Bus {bestHub.directBus}</span>
                    <span>·</span>
                    <span>~{bestHub.busTravelTimeMin}m ride</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400">Loading outlying hubs...</div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Rate Comparison</span>
                <span className="font-mono text-slate-200">$1.20/hr vs CBD $3.50/hr</span>
              </div>
            </div>

            {/* ERP Toll & Cost Snapshot */}
            <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Active ERP Cordon</div>
                  <div className="text-sm font-bold text-white font-mono tabular-nums">
                    ${erp?.rate.toFixed(2) ?? '0.00'}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {erp?.isPeak ? '(Peak Gantry)' : '(Off-Peak / Zero)'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <div>CBD Stamford Rd</div>
                <div className="text-emerald-400 font-bold">
                  {verdictData?.estimatedSavings ? 'Save >$5.00' : 'Compare Rates'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
