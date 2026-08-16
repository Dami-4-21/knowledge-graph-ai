import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

export const AskAIChatDrawer: React.FC = () => {
  const {
    isAskOpen,
    setIsAskOpen,
    chatMessages,
    askAI,
    notes,
    setActiveNoteId
  } = useKnowledgeGraph();

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAskOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAskOpen]);

  if (!isAskOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isSending) return;

    const q = inputQuery;
    setInputQuery('');
    setIsSending(true);

    try {
      await askAI(q);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#161A1E] shadow-2xl border-l border-[#2B2F36] z-50 flex flex-col animate-in slide-in-from-right duration-200 text-[#EAECEF] select-none font-mono">
      {/* Header */}
      <div className="p-3 border-b border-[#2B2F36] flex items-center justify-between bg-[#0B0E11] text-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider font-sans">Ask Knowledge AI</h3>
            <p className="text-[10px] text-gray-400">Grounded in your stored notes & graph</p>
          </div>
        </div>

        <button
          onClick={() => setIsAskOpen(false)}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-gray-200 no-scrollbar">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-yellow-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-yellow-400" />
                  <span>Knowledge AI</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded max-w-[90%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-yellow-500 text-black font-bold font-sans'
                  : 'bg-[#0B0E11] text-gray-200 border border-[#2B2F36] font-sans space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Citations / Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-[#2B2F36] space-y-1 font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    [Found in your notes]
                  </span>
                  {msg.sources.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const note = notes.find(n => n.title === s.noteTitle || n.id === s.noteId);
                        if (note) setActiveNoteId(note.id);
                      }}
                      className="p-1.5 bg-[#161A1E] border border-[#2B2F36] rounded hover:border-yellow-500/50 cursor-pointer transition-colors text-[11px]"
                    >
                      <span className="font-bold text-white flex items-center justify-between font-sans">
                        {s.noteTitle}
                        <ExternalLink className="w-3 h-3 text-yellow-400" />
                      </span>
                      <p className="text-gray-400 italic mt-0.5 line-clamp-2 font-sans">"{s.quote}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inferences */}
              {msg.inferences && msg.inferences.length > 0 && (
                <div className="pt-1.5 text-[11px] font-mono">
                  <span className="font-bold text-yellow-500 uppercase text-[9px] block mb-0.5">[AI Inference]</span>
                  <p className="text-gray-300 italic bg-[#161A1E] p-1.5 rounded border border-[#2B2F36] font-sans">{msg.inferences.join('; ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-gray-400 p-2 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
            <span>Searching notes & constructing grounded answer...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#2B2F36] bg-[#0B0E11]">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask anything about your notes..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isSending}
            className="w-full pl-3 pr-9 py-2 bg-[#161A1E] border border-[#2B2F36] rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isSending || !inputQuery.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
