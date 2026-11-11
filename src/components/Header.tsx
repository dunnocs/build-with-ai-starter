import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isLoading,
  lastUpdated,
}) => {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-SG', { hour12: false });
    } catch {
      return '--:--:--';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('verdict');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors"
        >
          SG Park & Ride <span className="text-emerald-400">04121</span>
        </a>

        {/* Zone 2: 4-5 Concise Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('verdict')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'verdict'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Decision Verdict
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'buses'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Live Bus Board
          </button>
          <button
            onClick={() => setActiveTab('campus')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'campus'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Campus Carparks
          </button>
          <button
            onClick={() => setActiveTab('park-ride')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'park-ride'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Park & Ride Hubs
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'map'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Transit Corridors
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center text-xs text-slate-400 font-mono tabular-nums">
            <span>Sync: {formatTime(lastUpdated)}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Feeds'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
