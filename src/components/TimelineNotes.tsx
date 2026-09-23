import React, { useState } from 'react';
import {
  Clock,
  Folder,
  Tag,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';
import { imageSrc } from '../lib/api';

interface TimelineNotesProps {
  onOpenNewNote: () => void;
}

export const TimelineNotes: React.FC<TimelineNotesProps> = ({ onOpenNewNote }) => {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    filters,
    setFilters
  } = useKnowledgeGraph();

  const [localSearch, setLocalSearch] = useState('');

  const LANE_STYLES: Record<string, string> = {
    learning: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    testing: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    client: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    inbox: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  };

  // Get unique collections
  const collections = ['ALL', ...Array.from(new Set(notes.map(n => n.collection || 'General')))];

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(localSearch.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(localSearch.toLowerCase())) ||
      n.concepts.some(c => c.name.toLowerCase().includes(localSearch.toLowerCase()));

    const matchesCollection =
      filters.selectedCollection === 'ALL' || n.collection === filters.selectedCollection;

    return matchesSearch && matchesCollection;
  });

  // Group notes chronologically by Date
  const groupNotesByDate = (noteList: typeof notes) => {
    const groups: { [key: string]: typeof noteList } = {};

    noteList.forEach(note => {
      const date = new Date(note.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(note);
    });

    return groups;
  };

  const grouped = groupNotesByDate(filteredNotes);

  return (
    <div className="h-full flex flex-col bg-[#161A1E] border-r border-[#2B2F36] select-none overflow-hidden text-[#EAECEF]">
      {/* Header & Controls */}
      <div className="p-3 border-b border-[#2B2F36] space-y-2 bg-[#161A1E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-500" />
            <h2 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Notes Timeline</h2>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#2B2F36] text-yellow-400 rounded border border-[#3E434B]">
              {notes.length}
            </span>
          </div>
          <button
            onClick={onOpenNewNote}
            className="px-2 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-yellow-400 border border-[#3E434B] rounded transition-colors text-xs font-bold flex items-center gap-1 font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Local Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Filter timeline notes..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs text-[#EAECEF] placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 font-mono"
          />
        </div>

        {/* Collections Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          <Filter className="w-3 h-3 text-gray-500 shrink-0" />
          {collections.map(col => (
            <button
              key={col}
              onClick={() => setFilters(prev => ({ ...prev, selectedCollection: col }))}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded whitespace-nowrap transition-colors ${
                filters.selectedCollection === col
                  ? 'bg-yellow-500 text-black font-bold'
                  : 'bg-[#2B2F36] text-gray-300 hover:bg-[#3E434B]'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-gray-400 font-mono">No notes found matching filters.</p>
            <button
              onClick={onOpenNewNote}
              className="mt-2 text-xs font-bold text-yellow-400 hover:underline font-mono"
            >
              + Create a new note
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, dateNotes]) => (
            <div key={dateLabel} className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                <span>{dateLabel}</span>
              </div>

              <div className="space-y-2">
                {dateNotes.map(note => {
                  const isActive = note.id === activeNoteId;
                  const timeString = new Date(note.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2B2F36] border-yellow-500/80 shadow-md ring-1 ring-yellow-500/20'
                          : 'bg-[#0B0E11] hover:bg-[#1A1F26] border-[#2B2F36]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-xs font-bold leading-snug font-sans ${isActive ? 'text-yellow-400' : 'text-white'}`}>
                          {note.title}
                        </h3>
                        <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                          {timeString}
                        </span>
                      </div>

                      {/* Type + Lane badges (Phase 1) */}
                      {(note.itemType || note.lane) && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {note.itemType && note.itemType !== 'Note' && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-[#2B2F36] text-gray-200 border border-[#3E434B]">
                              {note.itemType}
                            </span>
                          )}
                          {note.lane && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border ${LANE_STYLES[note.lane] || LANE_STYLES.inbox}`}>
                              {note.lane}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Screenshot thumbnail (Phase 3) */}
                      {note.imageUrl && (
                        <img
                          src={imageSrc(note.imageUrl)}
                          alt="screenshot"
                          className="mt-2 h-20 w-full object-cover rounded border border-[#2B2F36]"
                        />
                      )}

                      {/* Snippet */}
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {note.content.replace(/[#*`_]/g, '')}
                      </p>

                      {/* Collection & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#2B2F36] text-[10px] font-mono">
                        <span className="flex items-center gap-1 text-gray-400 font-medium truncate">
                          <Folder className="w-2.5 h-2.5 text-yellow-500 shrink-0" />
                          <span className="truncate">{note.collection || 'General'}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {note.processingStatus === 'PROCESSING' && (
                            <span className="flex items-center gap-1 text-amber-400 font-medium">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Analyzing...
                            </span>
                          )}
                          {note.processingStatus === 'COMPLETED' && (
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {note.concepts.length} concepts
                            </span>
                          )}
                          {note.processingStatus === 'FAILED' && (
                            <span className="flex items-center gap-1 text-rose-400 font-medium">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Retry
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Concept Tags preview */}
                      {note.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.concepts.slice(0, 3).map((c, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 bg-[#2B2F36] text-gray-300 rounded text-[9px] font-mono border border-[#3E434B]"
                            >
                              {c.name}
                            </span>
                          ))}
                          {note.concepts.length > 3 && (
                            <span className="text-[9px] text-gray-400 font-mono">
                              +{note.concepts.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
