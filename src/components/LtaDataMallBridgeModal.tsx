import React, { useState, useEffect } from 'react';
import { Server, X, CheckCircle, AlertCircle, RefreshCw, Send, Code, Terminal, Key } from 'lucide-react';

interface LtaDataMallBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LtaDataMallBridgeModal: React.FC<LtaDataMallBridgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Live tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<'health' | 'carpark' | 'busarrival'>('busarrival');
  const [testStopCode, setTestStopCode] = useState('83139');
  const [testServiceNo, setTestServiceNo] = useState('15');
  const [customHeaderKey, setCustomHeaderKey] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkHealth();
      runTest('busarrival');
    }
  }, [isOpen]);

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (e: any) {
      setHealthStatus({ status: 'error', message: e.message });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const runTest = async (endpoint: 'health' | 'carpark' | 'busarrival') => {
    setIsLoadingTest(true);
    setTestResult(null);

    let url = '/api/health';
    if (endpoint === 'carpark') {
      url = '/api/carparkavailability';
    } else if (endpoint === 'busarrival') {
      url = `/api/busarrival?BusStopCode=${encodeURIComponent(testStopCode || '04121')}${
        testServiceNo ? `&ServiceNo=${encodeURIComponent(testServiceNo)}` : ''
      }`;
    }

    const headers: Record<string, string> = {};
    if (customHeaderKey.trim()) {
      headers['AccountKey'] = customHeaderKey.trim();
    }

    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        url,
        data,
      });
    } catch (e: any) {
      setTestResult({
        status: 'FETCH_ERROR',
        message: e.message,
      });
    } finally {
      setIsLoadingTest(false);
    }
  };

  if (!isOpen) return null;

  const isConfigured = healthStatus?.ltaDataMall?.accountKeyConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">LTA DataMall Serverless Bridge</h3>
              <p className="text-[11px] text-slate-400">
                Direct connections to LTA BusArrival v3 & CarParkAvailabilityv2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Status Banner */}
          <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isConfigured ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Key className="w-4 h-4 text-amber-500" />
                )}
                <span className="font-bold text-slate-900 dark:text-white">
                  LTA DataMall AccountKey:
                </span>
                <span
                  className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                    isConfigured
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {isConfigured ? 'CONFIGURED IN ENV' : 'AWAITING KEY (Operating with Open Mirror)'}
                </span>
              </div>

              <button
                onClick={checkHealth}
                disabled={isLoadingHealth}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                <span>Recheck /api/health</span>
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              When you obtain your free LTA key from{' '}
              <a
                href="https://datamall.lta.gov.sg/"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline font-medium"
              >
                datamall.lta.gov.sg
              </a>
              , set <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">LTA_ACCOUNT_KEY="..."</code> in your <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">.env</code> file. The serverless functions automatically pass it to official endpoints.
            </p>
          </div>

          {/* Endpoints Table */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              Configured Serverless Endpoints in <code className="text-emerald-600 dark:text-emerald-400">/api/</code>:
            </span>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      GET /api/carparkavailability
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Target: <code className="text-[10px]">https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2</code>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEndpoint('carpark');
                      runTest('carpark');
                    }}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded font-semibold whitespace-nowrap cursor-pointer self-start sm:self-auto"
                  >
                    Test Carpark Endpoint
                  </button>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      GET /api/busarrival
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Target: <code className="text-[10px]">https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=...&amp;ServiceNo=...</code>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEndpoint('busarrival');
                      runTest('busarrival');
                    }}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded font-semibold whitespace-nowrap cursor-pointer self-start sm:self-auto"
                  >
                    Test Bus Arrival v3
                  </button>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      GET /api/health
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Target: <code className="text-[10px]">System &amp; LTA DataMall connection health verifier</code>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEndpoint('health');
                      runTest('health');
                    }}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded font-semibold whitespace-nowrap cursor-pointer self-start sm:self-auto"
                  >
                    Test Health
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tester Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">
              Live Test Runner
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  BusStopCode (e.g. 04121 or 83139)
                </label>
                <input
                  type="text"
                  value={testStopCode}
                  onChange={(e) => setTestStopCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  ServiceNo (Optional, e.g. 15 or 190)
                </label>
                <input
                  type="text"
                  value={testServiceNo}
                  onChange={(e) => setTestServiceNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Optional AccountKey Header (Test key)
                </label>
                <input
                  type="password"
                  placeholder="Paste temporary test key"
                  value={customHeaderKey}
                  onChange={(e) => setCustomHeaderKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runTest(selectedEndpoint)}
                disabled={isLoadingTest}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-md transition-colors cursor-pointer text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute {selectedEndpoint.toUpperCase()} Request</span>
              </button>
            </div>
          </div>

          {/* Raw Response Output */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Response Payload ({testResult?.url || '/api/busarrival'})</span>
              </span>
              {testResult?.status && (
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  HTTP {testResult.status}
                </span>
              )}
            </div>

            <pre className="p-3 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
              {isLoadingTest
                ? 'Calling endpoint...'
                : testResult
                ? JSON.stringify(testResult.data, null, 2)
                : 'Click "Execute Request" above to test any endpoint.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
