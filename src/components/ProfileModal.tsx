import React, { useEffect, useState } from 'react';
import { X, Sparkles, Loader2, RefreshCw, Star, Target, Activity, Lightbulb } from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

interface ProfileInsights {
  summary: string;
  strengths: string[];
  focusAreas: string[];
  patterns: string[];
  suggestions: string[];
}

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, getProfileInsights } = useKnowledgeGraph();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ProfileInsights | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProfileInsights();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isProfileOpen && !data) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileOpen]);

  if (!isProfileOpen) return null;

  const Section: React.FC<{ icon: React.ReactNode; title: string; items: string[] }> = ({ icon, title, items }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
        {icon}
        <span>{title}</span>
      </div>
      <ul className="space-y-1">
        {(items || []).map((it, i) => (
          <li key={i} className="text-xs text-gray-200 leading-relaxed pl-3 border-l-2 border-[#3E434B]">{it}</li>
        ))}
        {(!items || items.length === 0) && <li className="text-xs text-gray-500 italic pl-3">—</li>}
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#161A1E] rounded shadow-2xl border border-[#2B2F36] max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] text-[#EAECEF]">
        {/* Header */}
        <div className="p-3 bg-[#0B0E11] text-white flex items-center justify-between border-b border-[#2B2F36]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans">About You</h3>
              <p className="text-xs text-gray-400 font-sans">What your knowledge graph reveals about how you build & learn</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={load}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2B2F36] rounded transition-colors disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your graph…
            </div>
          )}
          {error && !loading && (
            <div className="text-xs text-rose-400 py-6 text-center">{error}</div>
          )}
          {data && !loading && (
            <>
              <p className="text-sm text-gray-100 leading-relaxed font-sans bg-[#0B0E11] border border-[#2B2F36] rounded p-3">
                {data.summary}
              </p>
              <Section icon={<Star className="w-3 h-3 text-yellow-400" />} title="Strengths" items={data.strengths} />
              <Section icon={<Target className="w-3 h-3 text-emerald-400" />} title="Focus Areas" items={data.focusAreas} />
              <Section icon={<Activity className="w-3 h-3 text-blue-400" />} title="Patterns" items={data.patterns} />
              <Section icon={<Lightbulb className="w-3 h-3 text-amber-400" />} title="Suggestions" items={data.suggestions} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
