import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Plus,
  Loader2,
  Folder,
  Tag,
  Globe
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ isOpen, onClose }) => {
  const { addNote } = useKnowledgeGraph();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collection, setCollection] = useState('Operating Systems');
  const [tagsString, setTagsString] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tagsArray = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      await addNote(
        title || 'New Note',
        content,
        collection || 'General',
        tagsArray,
        'Manual Input'
      );
      setTitle('');
      setContent('');
      setTagsString('');
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
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
              required
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
              required
            />
          </div>

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
              disabled={isSubmitting || !content.trim()}
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
