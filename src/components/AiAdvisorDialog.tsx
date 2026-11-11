import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface AiAdvisorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campusLotsCount: number;
}

const PRESET_QUERIES = [
  "I'm coming down the CTE from Ang Mo Kio at 8:45 AM. Should I drive to campus or park at Bishan?",
  "Is Bras Basah Complex usually full around 9:15 AM? What is the best backup?",
  "I have a 4-hour lecture at SMU. What is the total dollar difference between SMU basement and Park & Ride?",
  "Which direct bus from Old Airport Road / East Coast arrives at Stop 04121?",
];

export const AiAdvisorDialog: React.FC<AiAdvisorDialogProps> = ({
  isOpen,
  onClose,
  campusLotsCount,
}) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I am your Singapore Commute & Parking Advisor for SMU Stamford Road (Stop 04121). There are currently ${campusLotsCount} total lots available across the 8 civic ring carparks. Tell me where you are driving in from or how long you're staying, and I'll give you a pragmatic recommendation!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const newQuery = userText.trim();
    setQuery('');
    setConversation((prev) => [...prev, { role: 'user', text: newQuery }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: newQuery,
          userOrigin: 'Singapore Driver',
          durationHours: 3,
        }),
      });

      if (!res.ok) throw new Error('Advisor response failed');
      const data = await res.json();

      setConversation((prev) => [
        ...prev,
        { role: 'assistant', text: data.advice || 'Recommendation currently unavailable.' },
      ]);
    } catch {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Bras Basah Complex (HDB) and SMU Connexion currently have available lots. However, if you are arriving during peak CBD hours, parking at an outlying hub like Bukit Panjang (Bus 190) or Serangoon (Bus 147) avoids ERP toll charges and heavy ramp queues.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Commute & Parking Advisor</h3>
              <p className="text-[11px] text-slate-400">
                Ground-truth advice for SMU Stamford Rd (Stop 04121) & LTA feeds
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

        {/* Conversation View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Analyzing live lots, ERP rates, and bus headways...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions Strip */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Presets:
          </span>
          {PRESET_QUERIES.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSubmit(p)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
            >
              {p.slice(0, 42)}...
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything (e.g. 'Coming from Bedok on ECP at 9 AM, best option?')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleSubmit(query)}
            disabled={!query.trim() || isLoading}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-md transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
