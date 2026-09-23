import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Plus,
  Loader2,
  Folder,
  Tag,
  Globe,
  ImagePlus,
  Trash2,
  Lightbulb,
  Check
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';
import { NodeType, Lane } from '../types';

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_TYPES: NodeType[] = ['Note', 'Repo', 'Screenshot', 'Project', 'Client', 'Domain', 'DnsRecord', 'Server', 'Service', 'Vision', 'Learning'];
const LANES: { value: Lane; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'learning', label: 'Learning' },
  { value: 'testing', label: 'Testing' },
  { value: 'client', label: 'Client' },
];

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ isOpen, onClose }) => {
  const { addNote, uploadImage, extractImage, suggestAppliesTo, linkItems } = useKnowledgeGraph();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collection, setCollection] = useState('Operating Systems');
  const [tagsString, setTagsString] = useState('');
  const [itemType, setItemType] = useState<NodeType>('Note');
  const [lane, setLane] = useState<Lane>('inbox');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase 3: screenshot capture
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(undefined);
  const [imgBusy, setImgBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState('');

  // Phase 2b: "applies-to" — past learnings the AI thinks are relevant to this new project.
  const [appliesSuggestions, setAppliesSuggestions] = useState<{ id: string; title: string; reason: string }[]>([]);
  const [selectedLearningIds, setSelectedLearningIds] = useState<string[]>([]);
  const [appliesBusy, setAppliesBusy] = useState(false);
  const [appliesMsg, setAppliesMsg] = useState('');

  if (!isOpen) return null;

  const toggleLearning = (id: string) => {
    setSelectedLearningIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const findRelevantLearnings = async () => {
    setAppliesBusy(true);
    setAppliesMsg('');
    try {
      const suggestions = await suggestAppliesTo(title, content);
      setAppliesSuggestions(suggestions);
      setSelectedLearningIds(suggestions.map(s => s.id)); // pre-select all; user can uncheck
      setAppliesMsg(
        suggestions.length
          ? `Found ${suggestions.length} past learning${suggestions.length > 1 ? 's' : ''} that may apply.`
          : 'No past learnings looked relevant (or none captured yet).'
      );
    } catch (err: any) {
      setAppliesMsg(err?.message || 'Could not fetch suggestions.');
    } finally {
      setAppliesBusy(false);
    }
  };

  const clearApplies = () => {
    setAppliesSuggestions([]);
    setSelectedLearningIds([]);
    setAppliesMsg('');
  };

  const handleImageFile = (file: File | null | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      setAiMsg('');
      if (itemType === 'Note') setItemType('Screenshot');
      setImgBusy(true);
      try {
        const u = await uploadImage(dataUrl);
        setUploadedUrl(u);
      } catch (err) {
        console.error('Image upload failed:', err);
        setAiMsg('Upload failed — you can still save without the image.');
      } finally {
        setImgBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.startsWith('image/')) {
        handleImageFile(it.getAsFile());
        break;
      }
    }
  };

  const clearImage = () => {
    setImageDataUrl(null);
    setUploadedUrl(undefined);
    setAiMsg('');
  };

  const readWithAI = async () => {
    if (!imageDataUrl) return;
    setAiBusy(true);
    setAiMsg('');
    try {
      const r = await extractImage(imageDataUrl);
      if (r && !r.error && (r.title || r.description || r.text)) {
        if (r.title && !title.trim()) setTitle(r.title);
        const body = [r.description, r.text].filter(Boolean).join('\n\n');
        if (body) setContent(prev => (prev.trim() ? prev + '\n\n' + body : body));
        if (Array.isArray(r.tags) && r.tags.length && !tagsString.trim()) setTagsString(r.tags.join(', '));
        setAiMsg('AI read the screenshot ✓');
      } else {
        setAiMsg(r?.error ? `Could not read image: ${r.error}` : 'No readable text found in image.');
      }
    } catch (err: any) {
      setAiMsg(err.message || 'Image read failed.');
    } finally {
      setAiBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !uploadedUrl) || isSubmitting) return;

    setIsSubmitting(true);
    const tagsArray = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const created = await addNote(
        title || 'New Note',
        content || (uploadedUrl ? '(screenshot)' : ''),
        collection || 'General',
        tagsArray,
        url.trim() ? url.trim() : 'Manual Input',
        itemType,
        lane,
        url.trim() || undefined,
        uploadedUrl
      );
      // Phase 2b: link the chosen past learnings to this new project (Learning —Applies To→ Project).
      if (created?.id && selectedLearningIds.length) {
        selectedLearningIds.forEach(learningId => linkItems(learningId, created.id, 'APPLIES_TO'));
      }
      setTitle('');
      setContent('');
      setTagsString('');
      setUrl('');
      setItemType('Note');
      setLane('inbox');
      clearImage();
      clearApplies();
      onClose();
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset sample templates for fast testing
  const loadPreset = (presetType: 'os' | 'security' | 'ai') => {
    if (presetType === 'os') {
      setTitle('Process Scheduling Algorithms & Context Switching');
      setContent(`In an **Operating System**, the scheduler dictates CPU time slicing across threads.

- **Round Robin**: Uses fixed quantum time slots.
- **Preemptive Priority**: Higher priority tasks interrupt running processes.
- **Context Switch**: The kernel saves process registers, program counter, and stack state before switching CPU execution to a new thread.

*Impact*: High context switch frequency incurs CPU cache thrashing and memory overhead.`);
      setCollection('Operating Systems');
      setTagsString('scheduling, os, cpu, kernel');
    } else if (presetType === 'security') {
      setTitle('Zero Trust Architecture & Microsegmentation');
      setContent(`**Zero Trust Network Access (ZTNA)** enforces explicit verification for every request regardless of network boundary.

- **Microsegmentation**: Divides data center network zones to restrict lateral movement during breach.
- **Authentication**: Requires identity tokens, mTLS certificates, and least-privilege RBAC controls.
- **Kernel Enforcement**: Firewalls and eBPF filters validate packet signatures at the driver layer.`);
      setCollection('Cybersecurity');
      setTagsString('security, zero-trust, networking, ztna');
    } else if (presetType === 'ai') {
      setTitle('Transformer Attention Architecture & KV Cache');
      setContent(`Large Language Models (**LLMs**) rely on **Self-Attention** mechanisms to calculate token relationships across sequence lengths.

- **KV Cache**: Caches Key and Value matrices in **GPU VRAM** to accelerate autoregressive token generation.
- **Memory Bandwidth**: Token throughput is memory bandwidth bound during inference.
- **CUDA**: Optimizes tensor matrix multiplication routines on GPU execution streams.`);
      setCollection('AI & Hardware');
      setTagsString('ai, llm, gpu, cuda, memory');
    }
  };

  return (
    <div onPaste={handlePaste} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#161A1E] rounded shadow-2xl border border-[#2B2F36] max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] text-[#EAECEF]">
        {/* Header */}
        <div className="p-3 bg-[#0B0E11] text-white flex items-center justify-between border-b border-[#2B2F36]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans">Capture New Knowledge</h3>
              <p className="text-xs text-gray-400 font-sans">AI will automatically extract concepts, acronyms, and relationships</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Sample Notes Quick Bar */}
        <div className="p-3 bg-[#0B0E11] border-b border-[#2B2F36] flex items-center justify-between text-xs">
          <span className="font-bold text-gray-400">Load Sample Note:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadPreset('os')}
              className="px-2 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-white rounded font-bold border border-[#3E434B]"
            >
              OS Scheduling
            </button>
            <button
              type="button"
              onClick={() => loadPreset('security')}
              className="px-2 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-white rounded font-bold border border-[#3E434B]"
            >
              Zero Trust Security
            </button>
            <button
              type="button"
              onClick={() => loadPreset('ai')}
              className="px-2 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-white rounded font-bold border border-[#3E434B]"
            >
              AI & KV Cache
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs no-scrollbar">
          {/* Title Input */}
          <div>
            <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
              Note Title
            </label>
            <input
              type="text"
              placeholder="e.g. Memory Management & Page Tables..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B2F36] rounded text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 font-sans"
            />
          </div>

          {/* Collection & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                Collection
              </label>
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs font-bold text-white focus:outline-none focus:border-yellow-500 font-sans"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. kernel, memory, hardware"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs text-white focus:outline-none focus:border-yellow-500 font-sans"
              />
            </div>
          </div>

          {/* Type & Lane */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                Type
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as NodeType)}
                className="w-full px-3 py-1.5 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs font-bold text-white focus:outline-none focus:border-yellow-500 font-sans"
              >
                {ITEM_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                Lane
              </label>
              <select
                value={lane}
                onChange={(e) => setLane(e.target.value as Lane)}
                className="w-full px-3 py-1.5 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs font-bold text-white focus:outline-none focus:border-yellow-500 font-sans"
              >
                {LANES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* URL (optional) */}
          <div>
            <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
              URL / Link (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. https://github.com/user/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs text-white focus:outline-none focus:border-yellow-500 font-sans"
            />
          </div>

          {/* Screenshot / Image (optional, Phase 3) */}
          <div>
            <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
              Screenshot / Image (optional)
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-[#2B2F36] rounded p-3 flex items-center gap-3"
            >
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="preview" className="h-16 w-16 object-cover rounded border border-[#2B2F36] shrink-0" />
              ) : (
                <div className="text-gray-500 text-[11px] flex-1 font-sans">Drop, paste, or choose an image (phone camera/gallery supported).</div>
              )}
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="cursor-pointer px-2 py-1 bg-[#2B2F36] hover:bg-[#3E434B] text-white rounded font-bold border border-[#3E434B] inline-flex items-center gap-1.5">
                  {imgBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                  <span>{imgBusy ? 'Uploading…' : imageDataUrl ? 'Replace' : 'Choose image'}</span>
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageFile(e.target.files?.[0])} className="hidden" />
                </label>
                {imageDataUrl && (
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={readWithAI} disabled={aiBusy} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
                      {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{aiBusy ? 'Reading…' : 'Read with AI'}</span>
                    </button>
                    <button type="button" onClick={clearImage} title="Remove image" className="p-1 text-gray-400 hover:text-rose-400 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {aiMsg && <p className="text-[11px] text-gray-400 mt-1 font-sans">{aiMsg}</p>}
          </div>

          {/* Content Field */}
          <div>
            <label className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
              Note Content / Excerpt / Markdown
            </label>
            <textarea
              placeholder="Write your note content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-44 p-3 bg-[#0B0E11] border border-[#2B2F36] rounded text-xs text-gray-200 placeholder-gray-500 leading-relaxed focus:outline-none focus:border-yellow-500 resize-y font-sans"
            />
          </div>

          {/* Applies-To suggestions (Phase 2b) — only meaningful for Projects */}
          {itemType === 'Project' && (
            <div className="border border-[#2B2F36] rounded p-3 space-y-2 bg-[#0B0E11]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                  Learnings that apply
                </span>
                <button
                  type="button"
                  onClick={findRelevantLearnings}
                  disabled={appliesBusy}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {appliesBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{appliesBusy ? 'Thinking…' : 'Suggest from past learnings'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500 font-sans">
                Ask AI which of your past learnings apply to this project. Selected ones get linked (Applies&nbsp;To) so they show in the graph.
              </p>

              {appliesSuggestions.length > 0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                  {appliesSuggestions.map(s => {
                    const checked = selectedLearningIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleLearning(s.id)}
                        className={`w-full text-left p-2 rounded border flex items-start gap-2 transition-colors ${
                          checked ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#2B2F36] hover:border-[#3E434B]'
                        }`}
                      >
                        <span className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center ${
                          checked ? 'bg-indigo-500 border-indigo-500' : 'border-[#3E434B]'
                        }`}>
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-bold text-white text-[12px] font-sans truncate">{s.title}</span>
                          {s.reason && <span className="block text-[11px] text-gray-400 font-sans leading-snug">{s.reason}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {appliesMsg && <p className="text-[11px] text-gray-400 font-sans">{appliesMsg}</p>}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#2B2F36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !uploadedUrl)}
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 uppercase font-mono"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Build Graph</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
