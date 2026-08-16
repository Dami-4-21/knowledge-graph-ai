import React from 'react';
import {
  X,
  Eye,
  ArrowRight,
  Sparkles,
  Columns2,
  CheckCircle2
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

export const PerspectiveManager: React.FC = () => {
  const {
    isPerspectiveCompareOpen,
    setIsPerspectiveCompareOpen,
    perspectives,
    activePerspectiveId,
    setActivePerspectiveId,
    comparePerspectiveId,
    setComparePerspectiveId,
    notes,
    relationships
  } = useKnowledgeGraph();

  if (!isPerspectiveCompareOpen) return null;

  const p1 = perspectives.find(p => p.id === activePerspectiveId) || perspectives[0];
  const p2 = perspectives.find(p => p.id === comparePerspectiveId) || perspectives[1] || perspectives[0];

  // Extract all concepts
  const allConcepts = Array.from(
    new Set(notes.flatMap(n => n.concepts.map(c => c.name)))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#161A1E] rounded shadow-2xl border border-[#2B2F36] max-w-3xl w-full overflow-hidden flex flex-col max-h-[88vh] text-[#EAECEF]">
        {/* Header */}
        <div className="p-3 bg-[#0B0E11] text-white flex items-center justify-between border-b border-[#2B2F36]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans">Perspective Comparison Matrix</h3>
              <p className="text-xs text-gray-400 font-sans">Compare how different domain views re-evaluate knowledge relationships</p>
            </div>
          </div>

          <button
            onClick={() => setIsPerspectiveCompareOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perspective Pickers */}
        <div className="p-3 bg-[#0B0E11] border-b border-[#2B2F36] grid grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Perspective A (Active)</label>
            <select
              value={activePerspectiveId}
              onChange={(e) => setActivePerspectiveId(e.target.value)}
              className="w-full p-2 bg-[#161A1E] border border-[#2B2F36] rounded text-white font-bold focus:outline-none focus:border-yellow-500 font-sans"
            >
              {perspectives.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Perspective B (Compare)</label>
            <select
              value={comparePerspectiveId}
              onChange={(e) => setComparePerspectiveId(e.target.value)}
              className="w-full p-2 bg-[#161A1E] border border-[#2B2F36] rounded text-white font-bold focus:outline-none focus:border-yellow-500 font-sans"
            >
              {perspectives.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs text-gray-300 no-scrollbar">
          <div className="border border-[#2B2F36] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0E11] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#2B2F36]">
                  <th className="p-3 font-mono">Knowledge Concept</th>
                  <th className="p-3 font-semibold font-mono" style={{ color: p1.color }}>{p1.name} View</th>
                  <th className="p-3 font-semibold font-mono" style={{ color: p2.color }}>{p2.name} View</th>
                  <th className="p-3 text-right font-mono">Domain Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F36] font-mono text-xs">
                {allConcepts.map((conceptName: string, idx: number) => {
                  const isP1 = p1.priorityConcepts.some(pc => pc.toLowerCase() === conceptName.toLowerCase());
                  const isP2 = p2.priorityConcepts.some(pc => pc.toLowerCase() === conceptName.toLowerCase());

                  const score1 = isP1 ? 95 : 70;
                  const score2 = isP2 ? 95 : 70;
                  const diff = Math.abs(score1 - score2);

                  return (
                    <tr key={idx} className="hover:bg-[#2B2F36]/50 transition-colors">
                      <td className="p-3 font-bold text-white font-sans">{conceptName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isP1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#2B2F36] text-gray-400'
                        }`}>
                          {score1}% {isP1 && '• Core Focus'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isP2 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#2B2F36] text-gray-400'
                        }`}>
                          {score2}% {isP2 && '• Core Focus'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-yellow-400">
                        {diff > 0 ? `+${diff}% Shift` : 'Balanced'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
