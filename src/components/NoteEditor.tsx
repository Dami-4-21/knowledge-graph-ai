import React, { useState, useEffect } from 'react';
import {
  Save,
  Trash2,
  Sparkles,
  Tag,
  Folder,
  Globe,
  Loader2,
  BookOpen,
  Check,
  FileCode,
  Layers,
  Link2,
  HelpCircle
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';
import { imageSrc } from '../lib/api';

interface NoteEditorProps {
  onOpenNewNote: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ onOpenNewNote }) => {
  const {
    notes,
    activeNoteId,
    updateNote,
    deleteNote,
    reAnalyzeNote,
    extractLearnings
  } = useKnowledgeGraph();

  const activeNote = notes.find(n => n.id === activeNoteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collection, setCollection] = useState('General');
  const [tagsString, setTagsString] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [learningState, setLearningState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [learningCount, setLearningCount] = useState(0);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setCollection(activeNote.collection || 'General');
      setTagsString(activeNote.tags ? activeNote.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setCollection('General');
      setTagsString('');
    }
  }, [activeNoteId, activeNote]);

  if (!activeNote) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#161A1E] p-8 text-center text-[#EAECEF]">
        <div className="w-12 h-12 rounded bg-[#2B2F36] flex items-center justify-center text-yellow-500 mb-3 border border-[#3E434B]">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">No Note Selected</h3>
        <p className="text-xs text-gray-400 max-w-xs mt-1 font-mono">Select an existing note from the timeline or create a new one to begin capturing knowledge.</p>
        <button
          onClick={onOpenNewNote}
          className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded shadow-sm transition-colors font-mono"
        >
          + Create New Note
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!activeNoteId) return;
    setIsSaving(true);
    const tagsArray = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    await updateNote(activeNoteId, title, content, collection, tagsArray);
    setIsSaving(false);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2000);
  };

  const handleDelete = () => {
    // Two-tap in-app confirm (browser confirm() is blocked in many tablet webviews)
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    setConfirmingDelete(false);
    deleteNote(activeNote.id);
  };

  const handleReAnalyze = async () => {
    setIsSaving(true);
    await reAnalyzeNote(activeNote.id);
    setIsSaving(false);
  };

  const handleExtractLearnings = async () => {
    setLearningState('loading');
    const learnings = await extractLearnings(activeNote.id);
    setLearningCount(learnings.length);
    setLearningState('done');
    setTimeout(() => setLearningState('idle'), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-[#161A1E] text-[#EAECEF] overflow-hidden">
      {/* Editor Header Bar */}
      <div className="px-4 py-2 border-b border-[#2B2F36] flex flex-wrap items-center justify-between gap-2 bg-[#161A1E] shrink-0 font-mono">
        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
          <span className="font-bold text-yellow-400">{activeNote.collection || 'General'}</span>
          <span>•</span>
          <span>Created {new Date(activeNote.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
          {/* Re-analyze Button */}
          <button
            onClick={handleReAnalyze}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-yellow-400 border border-[#3E434B] rounded text-xs font-bold transition-colors disabled:opacity-50 font-mono"
            title="Re-run AI concept and relationship extraction on this note"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Extract AI Concepts</span>
          </button>

          {/* Learn-as-you-go: Extract Learnings Button */}
          <button
            onClick={handleExtractLearnings}
            disabled={learningState === 'loading'}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-blue-400 border border-[#3E434B] rounded text-xs font-bold transition-colors disabled:opacity-50 font-mono"
            title="Extract reusable learnings from this note into your Learning graph"
          >
            {learningState === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="hidden sm:inline">
              {learningState === 'loading'
                ? 'Learning…'
                : learningState === 'done'
                ? `${learningCount} learnings saved`
                : 'Extract Learnings'}
            </span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded text-xs font-bold transition-colors disabled:opacity-50 font-mono"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : hasSaved ? (
              <Check className="w-3.5 h-3.5 text-black" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Extracting...' : hasSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Delete Button (two-tap confirm) */}
          <button
            onClick={handleDelete}
            className={confirmingDelete
              ? 'flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-colors font-mono'
              : 'p-1 text-gray-400 hover:text-rose-400 hover:bg-[#2B2F36] rounded transition-colors'}
            title={confirmingDelete ? 'Tap again to confirm delete' : 'Delete Note'}
          >
            <Trash2 className="w-4 h-4" />
            {confirmingDelete && <span>Confirm?</span>}
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
        {/* Title Field */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title..."
            className="w-full text-lg sm:text-xl font-bold text-white placeholder-gray-600 border-b border-[#2B2F36] focus:border-yellow-500 focus:outline-none pb-1 transition-colors font-sans"
          />
        </div>

        {/* Metadata Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#0B0E11] border border-[#2B2F36] px-2.5 py-1 rounded text-gray-300">
            <Folder className="w-3.5 h-3.5 text-yellow-500" />
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="Collection"
              className="bg-transparent border-none text-xs font-mono font-bold focus:outline-none text-white w-28"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0E11] border border-[#2B2F36] px-2.5 py-1 rounded text-gray-300 flex-1 max-w-sm">
            <Tag className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="Tags (comma separated)..."
              className="bg-transparent border-none text-xs font-mono text-white focus:outline-none w-full"
            />
          </div>

          {activeNote.source && (
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Globe className="w-3 h-3 text-yellow-500" />
              <span>{activeNote.source}</span>
            </div>
          )}
        </div>

        {/* Screenshot (Phase 3) */}
        {activeNote.imageUrl && (
          <div>
            <img
              src={imageSrc(activeNote.imageUrl)}
              alt="attached screenshot"
              className="max-h-64 rounded border border-[#2B2F36] object-contain"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="pt-2 min-h-[200px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write markdown, ideas, excerpts, technical definitions, or copy articles here..."
            className="w-full h-64 sm:h-80 p-3 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs font-mono text-[#EAECEF] placeholder-gray-600 leading-relaxed focus:outline-none focus:border-yellow-500/80 resize-y transition-all"
          />
        </div>

        {/* AI Extracted Concepts & Acronyms Section */}
        <div className="pt-4 border-t border-[#2B2F36] space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Extracted Knowledge Elements
            </h4>
            <span className="text-[10px] text-gray-400">
              {activeNote.concepts.length} concepts, {activeNote.acronyms.length} acronyms
            </span>
          </div>

          {/* Concepts Chips */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Extracted Concepts & Entities:</span>
            {activeNote.concepts.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No concepts extracted yet. Click "Extract AI Concepts" above to analyze this note.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeNote.concepts.map(c => (
                  <div
                    key={c.id}
                    className="group relative flex items-center gap-1.5 px-2.5 py-1 bg-[#2B2F36] border border-[#3E434B] text-white rounded text-xs font-medium"
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-yellow-400 bg-[#161A1E] px-1 rounded">{c.type}</span>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-52 p-2.5 bg-[#0B0E11] text-white text-[11px] rounded border border-[#2B2F36] shadow-2xl z-30 pointer-events-none">
                      <p className="font-bold text-yellow-400">{c.name}</p>
                      <p className="text-gray-300 mt-0.5 leading-tight">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acronyms Chips */}
          {activeNote.acronyms.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Acronyms Recognized:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeNote.acronyms.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded text-xs font-mono font-medium"
                  >
                    <span className="font-bold">{a.acronym}</span>
                    <span className="text-gray-300 font-sans text-[11px]">= {a.expansion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
