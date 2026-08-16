import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  Link2,
  AlertCircle,
  Check,
  Plus,
  ArrowRight,
  BookOpen,
  Loader2,
  Target,
  ChevronRight
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

interface DiscoveryPanelProps {
  onOpenNewNote: () => void;
}

export const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ onOpenNewNote }) => {
  const {
    isDiscoveryOpen,
    setIsDiscoveryOpen,
    discoveries,
    knowledgeGaps,
    learningPaths,
    acceptDiscovery,
    rejectDiscovery,
    triggerDiscoveryScan,
    generateLearningPath
  } = useKnowledgeGraph();

  const [activeTab, setActiveTab] = useState<'discoveries' | 'gaps' | 'paths'>('discoveries');
  const [isScanning, setIsScanning] = useState(false);
  const [targetDomain, setTargetDomain] = useState('Computer Systems & AI');
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  if (!isDiscoveryOpen) return null;

  const handleScan = async () => {
    setIsScanning(true);
    await triggerDiscoveryScan();
    setIsScanning(false);
  };

  const handleGeneratePath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomain.trim()) return;
    setIsGeneratingPath(true);
    try {
      await generateLearningPath(targetDomain);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const pendingDiscoveries = discoveries.filter(d => d.status === 'PENDING');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#161A1E] rounded shadow-2xl border border-[#2B2F36] max-w-2xl w-full overflow-hidden flex flex-col max-h-[88vh] text-[#EAECEF]">
        {/* Header */}
        <div className="p-3 bg-[#0B0E11] text-white flex items-center justify-between border-b border-[#2B2F36]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 font-sans">
                AI Knowledge Discovery Engine
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold px-2 py-0.5 rounded font-mono">
                  Autonomous Reasoning
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-sans">Uncover hidden connections, missing concepts, and personalized learning paths</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Scanning...' : 'Scan Graph'}</span>
            </button>
            <button
              onClick={() => setIsDiscoveryOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="flex border-b border-[#2B2F36] bg-[#0B0E11] px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('discoveries')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'discoveries'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Unlinked Connections ({pendingDiscoveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'gaps'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Knowledge Gaps ({knowledgeGaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('paths')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'paths'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Learning Paths</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs text-gray-300 no-scrollbar">
          {/* TAB 1: DISCOVERIES */}
          {activeTab === 'discoveries' && (
            <div className="space-y-3">
              {pendingDiscoveries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Compass className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="font-bold text-white">All discoveries reviewed!</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">Click 'Scan Graph' above to analyze your notes for new indirect connections.</p>
                </div>
              ) : (
                pendingDiscoveries.map(disc => (
                  <div
                    key={disc.id}
                    className="p-4 bg-[#0B0E11] border border-[#2B2F36] rounded space-y-2 hover:border-yellow-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-sans">{disc.sourceConcept}</span>
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded font-bold text-[10px]">
                          {disc.suggestedType}
                        </span>
                        <span className="font-bold text-white text-sm font-sans">{disc.targetConcept}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded font-bold text-[10px]">
                        {Math.round(disc.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-gray-200 leading-relaxed bg-[#161A1E] p-3 rounded border border-[#2B2F36] font-sans">
                      <span className="font-bold text-yellow-400 font-mono">Why? </span>
                      {disc.why}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-400 italic">
                        Evidence notes: {disc.evidenceNotes.join(', ') || 'Cross-note analysis'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => rejectDiscovery(disc.id)}
                          className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-[#2B2F36] rounded font-bold"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => acceptDiscovery(disc.id)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Link</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: KNOWLEDGE GAPS */}
          {activeTab === 'gaps' && (
            <div className="space-y-3">
              {knowledgeGaps.map(gap => (
                <div key={gap.id} className="p-4 bg-[#0B0E11] border border-rose-500/30 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 font-sans">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      Missing Concept: {gap.missingConcept}
                    </h4>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold text-[10px] uppercase">
                      {gap.urgency} Priority
                    </span>
                  </div>

                  <p className="text-gray-200 leading-normal font-sans">{gap.description}</p>
                  <p className="text-[11px] text-gray-300 bg-[#161A1E] p-2.5 rounded border border-[#2B2F36] font-sans">
                    <span className="font-bold text-rose-400 font-mono">Gap Reason: </span>
                    {gap.reason}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-400">
                      Connects with: {gap.connectedKnownConcepts.join(', ')}
                    </span>
                    <button
                      onClick={() => {
                        setIsDiscoveryOpen(false);
                        onOpenNewNote();
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded flex items-center gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Note for This</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LEARNING PATHS */}
          {activeTab === 'paths' && (
            <div className="space-y-4">
              <form onSubmit={handleGeneratePath} className="p-3 bg-[#0B0E11] border border-[#2B2F36] rounded flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Target domain (e.g., AI Infrastructure, Cybersecurity)..."
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#161A1E] border border-[#2B2F36] rounded text-xs focus:outline-none focus:border-yellow-500 text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={isGeneratingPath || !targetDomain.trim()}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  {isGeneratingPath && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Path</span>
                </button>
              </form>

              {learningPaths.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-sans">
                  Enter a domain above to generate an AI learning sequence tailored to your current knowledge state.
                </div>
              ) : (
                learningPaths.map(lp => (
                  <div key={lp.id} className="p-4 bg-[#0B0E11] border border-[#2B2F36] rounded space-y-3">
                    <h4 className="font-bold text-white text-sm font-sans">{lp.title}</h4>

                    <div className="space-y-2">
                      {lp.steps.map(step => (
                        <div key={step.stepNumber} className="p-3 bg-[#161A1E] border border-[#2B2F36] rounded space-y-1">
                          <div className="flex items-center justify-between font-bold text-white">
                            <span className="flex items-center gap-2 font-sans">
                              <span className="w-5 h-5 rounded bg-yellow-500 text-black flex items-center justify-center text-[10px] font-mono font-extrabold">
                                {step.stepNumber}
                              </span>
                              {step.concept}
                            </span>
                          </div>
                          <p className="text-gray-300 text-[11px] leading-relaxed pl-7 font-sans">{step.description}</p>
                          <p className="text-[10px] text-yellow-400 pl-7 font-bold">
                            Why next: {step.whyNext}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
