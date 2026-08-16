import React, { useState } from 'react';
import {
  BrainCircuit,
  Search,
  Sparkles,
  Compass,
  Plus,
  Layers,
  Settings,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Columns2,
  Maximize2,
  FileText
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

interface TopBarProps {
  viewLayout: 'split' | 'graph-focus' | 'notes-focus';
  setViewLayout: (layout: 'split' | 'graph-focus' | 'notes-focus') => void;
  onOpenNewNote: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  viewLayout,
  setViewLayout,
  onOpenNewNote
}) => {
  const {
    perspectives,
    activePerspectiveId,
    setActivePerspectiveId,
    filters,
    setFilters,
    isAskOpen,
    setIsAskOpen,
    isDiscoveryOpen,
    setIsDiscoveryOpen,
    isPerspectiveCompareOpen,
    setIsPerspectiveCompareOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    discoveries,
    createCustomPerspective
  } = useKnowledgeGraph();

  const [isPerspectiveDropdownOpen, setIsPerspectiveDropdownOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activePerspective = perspectives.find(p => p.id === activePerspectiveId) || perspectives[0];
  const pendingDiscoveriesCount = discoveries.filter(d => d.status === 'PENDING').length;

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    try {
      await createCustomPerspective(customPrompt);
      setCustomPrompt('');
      setIsCreatingCustom(false);
      setIsPerspectiveDropdownOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <header className="h-12 bg-[#161A1E] border-b border-[#2B2F36] px-4 flex items-center justify-between gap-3 shrink-0 z-20 text-[#EAECEF]">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-yellow-500 flex items-center justify-center text-black font-extrabold shadow-sm">
          <BrainCircuit className="w-4 h-4 text-black" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm leading-tight tracking-tight flex items-center gap-2 font-sans">
            KNOWLEDGE<span className="text-yellow-500">NEXUS</span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2B2F36] text-yellow-400 border border-[#3E434B]">
              v2.4 SEMANTIC
            </span>
          </h1>
          <p className="text-[10px] text-gray-400 hidden sm:block font-mono">High-Density Knowledge Graph Engine</p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search concepts, notes, acronyms, or relationships..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-8 pr-4 py-1 bg-[#2B2F36] border border-[#2B2F36] focus:border-yellow-500/50 rounded text-xs text-[#EAECEF] placeholder-gray-500 focus:outline-none transition-all font-mono"
          />
          {filters.searchTerm && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Perspective Selector & AI Tools */}
      <div className="flex items-center gap-2">
        {/* Perspective Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPerspectiveDropdownOpen(!isPerspectiveDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 bg-[#2B2F36] hover:bg-[#3E434B] border border-[#2B2F36] rounded text-xs font-medium text-[#EAECEF] transition-colors"
            title="Change Knowledge Perspective"
          >
            <Eye className="w-3.5 h-3.5 text-yellow-500" />
            <span className="hidden sm:inline text-gray-400">View:</span>
            <span className="font-bold text-white" style={{ color: activePerspective.color }}>
              {activePerspective.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
          </button>

          {isPerspectiveDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#161A1E] rounded-md shadow-2xl border border-[#2B2F36] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-[#2B2F36] flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Select Perspective</span>
                <button
                  onClick={() => setIsPerspectiveCompareOpen(true)}
                  className="text-[11px] font-medium text-yellow-400 hover:text-yellow-300"
                >
                  Compare Two
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto py-1 no-scrollbar">
                {perspectives.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePerspectiveId(p.id);
                      setFilters(prev => ({ ...prev, selectedPerspectiveId: p.id }));
                      setIsPerspectiveDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-start justify-between hover:bg-[#2B2F36] transition-colors ${
                      p.id === activePerspectiveId ? 'bg-[#2B2F36]' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#EAB308' }} />
                        <span className="text-xs font-semibold text-white">{p.name}</span>
                        {p.isCustom && (
                          <span className="text-[10px] px-1.5 bg-yellow-500/20 text-yellow-400 rounded font-mono">Custom</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>
                    </div>
                    {p.id === activePerspectiveId && (
                      <Check className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Perspective Form */}
              <div className="px-3 pt-2 border-t border-[#2B2F36]">
                {!isCreatingCustom ? (
                  <button
                    onClick={() => setIsCreatingCustom(true)}
                    className="w-full text-center py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-xs font-medium text-yellow-400 rounded border border-dashed border-[#3E434B] transition-colors font-mono"
                  >
                    + Generate AI Perspective
                  </button>
                ) : (
                  <form onSubmit={handleCreateCustom} className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity Specialist..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-[#0B0E11] border border-[#2B2F36] text-white rounded focus:outline-none focus:border-yellow-500 font-mono"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingCustom(false)}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isGenerating || !customPrompt.trim()}
                        className="px-2.5 py-1 text-xs bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isGenerating && <Sparkles className="w-3 h-3 animate-spin" />}
                        Generate
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Discovery Engine Button */}
        <button
          onClick={() => setIsDiscoveryOpen(true)}
          className="relative flex items-center gap-1.5 px-2.5 py-1 bg-[#2B2F36] hover:bg-[#3E434B] border border-[#2B2F36] text-amber-400 rounded text-xs font-medium transition-colors"
          title="AI Discovery Engine & Knowledge Gaps"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Discovery</span>
          {pendingDiscoveriesCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold font-mono rounded">
              {pendingDiscoveriesCount}
            </span>
          )}
        </button>

        {/* Ask AI Assistant Button */}
        <button
          onClick={() => setIsAskOpen(!isAskOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
            isAskOpen
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-[#2B2F36] hover:bg-[#3E434B] text-blue-400 border border-[#2B2F36]'
          }`}
          title="Ask AI Assistant over Notes"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* New Note Button */}
        <button
          onClick={onOpenNewNote}
          className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        {/* View Layout Toggles */}
        <div className="flex items-center bg-[#2B2F36] p-0.5 rounded border border-[#2B2F36] ml-1">
          <button
            onClick={() => setViewLayout('notes-focus')}
            className={`p-1 rounded transition-all ${
              viewLayout === 'notes-focus' ? 'bg-[#161A1E] text-yellow-500 font-bold' : 'text-gray-400 hover:text-white'
            }`}
            title="Notes Focus Layout"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewLayout('split')}
            className={`p-1 rounded transition-all ${
              viewLayout === 'split' ? 'bg-[#161A1E] text-yellow-500 font-bold' : 'text-gray-400 hover:text-white'
            }`}
            title="3-Panel Split View"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewLayout('graph-focus')}
            className={`p-1 rounded transition-all ${
              viewLayout === 'graph-focus' ? 'bg-[#161A1E] text-yellow-500 font-bold' : 'text-gray-400 hover:text-white'
            }`}
            title="Full Graph View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Settings / Graph Stats */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1 text-gray-400 hover:text-white hover:bg-[#2B2F36] rounded transition-colors"
          title="Graph Analytics & Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
