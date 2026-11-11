import React, { useState } from 'react';
import { CommuteVerdictResponse, CarparkItem } from '../types';
import { DollarSign, Clock, ShieldAlert, CheckCircle2, TrendingDown } from 'lucide-react';

interface CommuteComparatorProps {
  verdictData: CommuteVerdictResponse | null;
  campusCarparks: CarparkItem[];
  parkAndRideHubs: CarparkItem[];
}

export const CommuteComparator: React.FC<CommuteComparatorProps> = ({
  verdictData,
  campusCarparks,
  parkAndRideHubs,
}) => {
  const [durationHours, setDurationHours] = useState<number>(3);
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    campusCarparks[0]?.id || 'SMU-ADMIN'
  );
  const [selectedHubId, setSelectedHubId] = useState<string>(
    parkAndRideHubs[0]?.id || 'PR-BP-01'
  );

  const activeCampus =
    campusCarparks.find((c) => c.id === selectedCampusId) ||
    verdictData?.bestCampusOption ||
    campusCarparks[0];

  const activeHub =
    parkAndRideHubs.find((h) => h.id === selectedHubId) ||
    verdictData?.bestParkAndRideOption ||
    parkAndRideHubs[0];

  const erpRate = verdictData?.erpStatus?.rate || 0;

  // Option A (Drive Direct) Calculations
  const campusParkingRate = activeCampus?.hourlyRate || 3.50;
  const optionACost = campusParkingRate * durationHours + erpRate;
  const optionASearchMinutes = activeCampus?.availableLots < 15 ? 12 : activeCampus?.availableLots < 35 ? 7 : 2;
  const optionAWalkMinutes = activeCampus?.walkingMin || 2;

  // Option B (Park & Ride) Calculations
  const hubParkingRate = activeHub?.hourlyRate || 1.20;
  const busFareRoundTrip = 3.20; // $1.60 each way on adult contactless
  const optionBCost = hubParkingRate * durationHours + busFareRoundTrip;
  const optionBBusMinutes = activeHub?.busTravelTimeMin || 20;

  const costSavings = Math.max(0, optionACost - optionBCost);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Commute Comparison: Drive Direct vs. Park & Ride
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculate exact parking fees, ERP cordon charges, transit time, and parking search friction.
          </p>
        </div>

        {/* Duration Slider */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Stay Duration:
          </span>
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-12 text-center tabular-nums">
            {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
          </span>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={durationHours}
            onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
            className="w-24 sm:w-32 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPTION A: DRIVE DIRECT */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-5 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Option A · Direct Driving
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                To SMU Stamford Rd
              </span>
            </div>

            {/* Select Target Campus Carpark */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Destination Carpark:
              </label>
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {campusCarparks.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.availableLots} lots free · {c.walkingMin}m walk)
                  </option>
                ))}
              </select>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 py-3 border-y border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Parking Fee (${campusParkingRate.toFixed(2)}/hr × {durationHours}h)</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  ${(campusParkingRate * durationHours).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>CBD Cordon ERP Gantry Toll</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  ${erpRate.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ramp Queue & Search Time</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  ~{optionASearchMinutes} mins (Stress risk)
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Walk to Bus Stop 04121 / Concourse</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  ~{optionAWalkMinutes} mins
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Driving Cost</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                ${optionACost.toFixed(2)}
              </span>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              {activeCampus && activeCampus.availableLots < 15 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Lots nearly exhausted
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fast if lots exist
                </span>
              )}
            </div>
          </div>
        </div>

        {/* OPTION B: PARK & RIDE */}
        <div className="border border-emerald-300 dark:border-emerald-800/60 rounded-lg p-5 bg-emerald-50/40 dark:bg-slate-950 flex flex-col justify-between relative">
          <div className="absolute top-3 right-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
            RECOMMENDED FOR COST & PEAK
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-mono">
                Option B · Park & Ride
              </span>
            </div>

            {/* Select Hub */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Outlying Carpark Hub:
              </label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {parkAndRideHubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} · Bus {h.directBus} ({h.availableLots} lots · ~{h.busTravelTimeMin}m ride)
                  </option>
                ))}
              </select>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 py-3 border-y border-emerald-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>HDB Parking Fee (${hubParkingRate.toFixed(2)}/hr × {durationHours}h)</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  ${(hubParkingRate * durationHours).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>CBD Cordon ERP Toll</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                  $0.00 (Avoided!)
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Public Bus Fare (2-Way to Stop 04121)</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  ${busFareRoundTrip.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Bus Ride Duration (Direct Service {activeHub?.directBus})</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  ~{optionBBusMinutes} mins
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Park & Ride Cost</span>
              <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                ${optionBCost.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded">
                <TrendingDown className="w-3.5 h-3.5" /> Save ${costSavings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
