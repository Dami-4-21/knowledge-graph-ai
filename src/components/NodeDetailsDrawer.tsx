import React from 'react';
import { relationshipLabel } from '../types';
import {
  X,
  BookOpen,
  Sparkles,
  Link2,
  Folder,
  Tag,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

export const NodeDetailsDrawer: React.FC = () => {
  const {
    selectedNodeId,
    setSelectedNodeId,
    notes,
    relationships,
    setActiveNoteId,
    setIsAskOpen,
    setSelectedRelationshipId,
    perspectives,
    activePerspectiveId
  } = useKnowledgeGraph();

  if (!selectedNodeId) return null;

  const activePerspective = perspectives.find(p => p.id === activePerspectiveId) || perspectives[0];

  // Find node details across notes
  const allConcepts = notes.flatMap(n => n.concepts);
  const matchingConcept = allConcepts.find(c => c.name.toLowerCase() === selectedNodeId.toLowerCase());

  const conceptName = matchingConcept ? matchingConcept.name : selectedNodeId;
  const conceptType = matchingConcept ? matchingConcept.type : 'Concept';
  const description = matchingConcept ? matchingConcept.description : 'Extracted knowledge node.';

  // Find connected relationships
  const connectedRels = relationships.filter(r =>
    r.sourceName.toLowerCase() === selectedNodeId.toLowerCase() ||
    r.targetName.toLowerCase() === selectedNodeId.toLowerCase()
  );

  // Find source notes
  const sourceNotes = notes.filter(n =>
    n.concepts.some(c => c.name.toLowerCase() === selectedNodeId.toLowerCase()) ||
    n.acronyms.some(a => a.acronym.toLowerCase() === selectedNodeId.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#161A1E] shadow-2xl border-l border-[#2B2F36] z-50 flex flex-col animate-in slide-in-from-right duration-200 text-[#EAECEF] select-none font-mono">
      {/* Drawer Header */}
      <div className="p-3 border-b border-[#2B2F36] flex items-start justify-between bg-[#161A1E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
              {conceptType}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">ID: {selectedNodeId.slice(0, 12)}</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1 font-sans">{conceptName}</h2>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#2B2F36] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-gray-300 no-scrollbar">
        {/* Description */}
        <div>
          <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1">
            Definition / AI Summary
          </h4>
          <p className="bg-[#0B0E11] p-3 rounded border border-[#2B2F36] leading-relaxed text-gray-200">
            {description || 'System concept extracted from your personal learning notes.'}
          </p>
        </div>

        {/* Perspective Relevance */}
        <div className="p-3 bg-[#2B2F36] border border-[#3E434B] rounded space-y-1">
          <div className="flex items-center justify-between font-bold text-white">
            <span>Perspective ({activePerspective.name}):</span>
            <span className="text-yellow-400 font-bold">
              {activePerspective.priorityConcepts.some(pc => pc.toLowerCase() === selectedNodeId.toLowerCase()) ? 'High Priority' : 'Standard'}
            </span>
          </div>
          <p className="text-[11px] text-gray-300 leading-normal font-sans">
            Relationships involving this concept are re-weighted under the active domain view.
          </p>
        </div>

        {/* Connected Graph Concepts */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
            Connected Knowledge Nodes ({connectedRels.length})
          </h4>

          {connectedRels.length === 0 ? (
            <p className="text-gray-500 italic">No direct relationships connected to this node.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {connectedRels.map(rel => {
                const isSource = rel.sourceName.toLowerCase() === selectedNodeId.toLowerCase();
                const otherName = isSource ? rel.targetName : rel.sourceName;

                return (
                  <div
                    key={rel.id}
                    onClick={() => setSelectedRelationshipId(rel.id)}
                    className="p-2 bg-[#0B0E11] border border-[#2B2F36] hover:border-yellow-500 rounded flex items-center justify-between gap-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-white truncate font-sans">{otherName}</span>
                      <span className="text-[10px] text-gray-400 uppercase bg-[#2B2F36] px-1.5 py-0.5 rounded">
                        {relationshipLabel(rel.relationshipType)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-yellow-400 font-bold shrink-0">
                      <span>{Math.round(rel.baseScore * 100)}%</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Source Notes */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
            Source Notes ({sourceNotes.length})
          </h4>

          {sourceNotes.length === 0 ? (
            <p className="text-gray-500 italic">No direct note references found.</p>
          ) : (
            <div className="space-y-2">
              {sourceNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    setActiveNoteId(n.id);
                    setSelectedNodeId(null);
                  }}
                  className="p-2.5 bg-[#0B0E11] border border-[#2B2F36] hover:border-yellow-500/50 rounded cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-white font-bold group-hover:text-yellow-400 font-sans">
                    <span>{n.title}</span>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-yellow-400" />
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                    {n.content.replace(/[#*`_]/g, '')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Action */}
      <div className="p-3 border-t border-[#2B2F36] bg-[#161A1E]">
        <button
          onClick={() => {
            setIsAskOpen(true);
            setSelectedNodeId(null);
          }}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 uppercase font-mono"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI about {conceptName}</span>
        </button>
      </div>
    </div>
  );
};
