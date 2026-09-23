import React, { useState } from 'react';
import { relationshipLabel } from '../types';
import {
  X,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';

export const RelationshipExplanationModal: React.FC = () => {
  const {
    selectedRelationshipId,
    setSelectedRelationshipId,
    relationships,
    notes,
    confirmRelationship,
    perspectives,
    activePerspectiveId
  } = useKnowledgeGraph();

  if (!selectedRelationshipId) return null;

  const rel = relationships.find(r => r.id === selectedRelationshipId);
  if (!rel) return null;

  const activePerspective = perspectives.find(p => p.id === activePerspectiveId) || perspectives[0];

  const breakdown = rel.breakdown || {
    semanticSimilarity: 0.85,
    sharedConcepts: 0.90,
    explicitReferences: 0.95,
    relationshipInference: 0.88,
    evidenceStrength: 0.92,
    contextualRelevance: 0.90
  };

  const scorePercent = Math.round(rel.baseScore * 100);
  const confidencePercent = Math.round(rel.confidence * 100);

  // Find evidence note titles
  const evidenceNotes = notes.filter(n => rel.sourceNoteIds.includes(n.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#161A1E] rounded shadow-2xl border border-[#2B2F36] max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] text-[#EAECEF]">
        {/* Header */}
        <div className="p-3 bg-[#0B0E11] text-white flex items-center justify-between border-b border-[#2B2F36]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                Relationship Explanation & Evidence
              </span>
              <h3 className="text-xs font-bold flex items-center gap-1.5 mt-0.5 font-sans">
                <span>{rel.sourceName}</span>
                <span className="px-1.5 py-0.2 bg-yellow-500 text-black text-[10px] font-bold rounded">{relationshipLabel(rel.relationshipType)}</span>
                <span>{rel.targetName}</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => setSelectedRelationshipId(null)}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-gray-300 no-scrollbar">
          {/* Top Score Banner */}
          <div className="flex items-center justify-between p-3 bg-[#0B0E11] rounded border border-[#2B2F36]">
            <div>
              <span className="text-[11px] font-bold text-white uppercase">Composite Relationship Score</span>
              <p className="text-[11px] text-gray-400 mt-0.5">AI Confidence: {confidencePercent}%</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xl font-extrabold text-yellow-400">{scorePercent}%</span>
              <span className="block text-[10px] text-yellow-500 font-bold uppercase">
                {scorePercent >= 85 ? 'Strong Link' : 'Inferred Link'}
              </span>
            </div>
          </div>

          {/* AI Explanation Rationale */}
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
              Why are these connected?
            </h4>
            <p className="p-3 bg-[#0B0E11] border border-[#2B2F36] rounded text-gray-200 leading-relaxed font-sans text-xs">
              {rel.explanation || `${rel.sourceName} and ${rel.targetName} interact directly across system execution pathways and architectural specifications.`}
            </p>
          </div>

          {/* Perspective Weight Influence */}
          <div className="p-3 bg-[#2B2F36] border border-[#3E434B] rounded space-y-1">
            <div className="flex items-center justify-between text-white font-bold">
              <span>Perspective Context: {activePerspective.name}</span>
              <span className="text-yellow-400 font-bold font-mono">{scorePercent}%</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-normal font-sans">
              {activePerspective.description} Priority rules adjust visual edge weight for domain exploration.
            </p>
          </div>

          {/* Score Formula Decomposition */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
              Score Decomposition Formula
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-[#0B0E11] rounded border border-[#2B2F36] flex justify-between">
                <span className="text-gray-400">Semantic Sim (20%)</span>
                <span className="font-bold text-yellow-400">{Math.round((breakdown.semanticSimilarity || 0.85) * 100)}%</span>
              </div>
              <div className="p-2 bg-[#0B0E11] rounded border border-[#2B2F36] flex justify-between">
                <span className="text-gray-400">Shared Concepts (15%)</span>
                <span className="font-bold text-yellow-400">{Math.round((breakdown.sharedConcepts || 0.9) * 100)}%</span>
              </div>
              <div className="p-2 bg-[#0B0E11] rounded border border-[#2B2F36] flex justify-between">
                <span className="text-gray-400">Explicit Refs (20%)</span>
                <span className="font-bold text-yellow-400">{Math.round((breakdown.explicitReferences || 0.95) * 100)}%</span>
              </div>
              <div className="p-2 bg-[#0B0E11] rounded border border-[#2B2F36] flex justify-between">
                <span className="text-gray-400">Rel Inference (20%)</span>
                <span className="font-bold text-yellow-400">{Math.round((breakdown.relationshipInference || 0.88) * 100)}%</span>
              </div>
              <div className="p-2 bg-[#0B0E11] rounded border border-[#2B2F36] flex justify-between">
                <span className="text-gray-400">Evidence Strength (15%)</span>
                <span className="font-bold text-yellow-400">{Math.round((breakdown.evidenceStrength || 0.92) * 100)}%</span>
              </div>
              <div className="p-2 bg-[#0B0E11] rounded border border-[#2B2F36] flex justify-between">
                <span className="text-gray-400">Context Relevance (10%)</span>
                <span className="font-bold text-yellow-400">{Math.round((breakdown.contextualRelevance || 0.9) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Ground-Truth Evidence Quotes */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
              Evidence Quotes from User Notes
            </h4>

            {rel.evidence && rel.evidence.length > 0 ? (
              <div className="space-y-2 font-sans">
                {rel.evidence.map((quote, idx) => (
                  <div key={idx} className="p-2.5 bg-[#0B0E11] border-l-2 border-yellow-500 rounded-r text-gray-200 italic leading-snug text-xs">
                    "{quote}"
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No direct quote snippet attached.</p>
            )}
          </div>
        </div>

        {/* User Confirmation Feedback Footer */}
        <div className="p-3 bg-[#0B0E11] border-t border-[#2B2F36] flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-gray-300">
            Is this relationship accurate?
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                confirmRelationship(rel.id, true);
                setSelectedRelationshipId(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                rel.userConfirmed === true
                  ? 'bg-green-500 text-black shadow-xs'
                  : 'bg-[#2B2F36] border border-[#3E434B] text-gray-200 hover:bg-green-500/20 hover:text-green-400'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Useful</span>
            </button>

            <button
              onClick={() => {
                confirmRelationship(rel.id, false);
                setSelectedRelationshipId(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                rel.userConfirmed === false
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-[#2B2F36] border border-[#3E434B] text-gray-200 hover:bg-rose-500/20 hover:text-rose-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reject Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
