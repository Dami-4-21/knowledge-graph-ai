import React, { useState } from 'react';
import { X, Link2, ArrowRight } from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';
import { RelationshipType } from '../types';

const ENTITY_TYPES = ['Repo', 'Screenshot', 'Project', 'Client', 'Domain', 'DnsRecord', 'Server', 'Service', 'Vision', 'Learning'];

const REL_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'RELATED_TO', label: 'related to' },
  { value: 'POINTS_TO', label: 'points to (DNS →)' },
  { value: 'HOSTED_ON', label: 'hosted on' },
  { value: 'USES_API', label: 'uses API' },
  { value: 'BELONGS_TO', label: 'belongs to (client)' },
  { value: 'TESTING_FOR', label: 'testing for' },
  { value: 'LEARNED_FROM', label: 'learned from' },
  { value: 'APPLIES_TO', label: 'applies to' },
  { value: 'DEPENDS_ON', label: 'depends on' },
  { value: 'PART_OF', label: 'part of' },
];

export const ConnectItemsModal: React.FC = () => {
  const { isConnectOpen, setIsConnectOpen, notes, linkItems } = useKnowledgeGraph();
  const items = notes.filter(n => n.itemType && ENTITY_TYPES.includes(n.itemType));

  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState<RelationshipType>('RELATED_TO');
  const [saved, setSaved] = useState(false);

  if (!isConnectOpen) return null;

  const canLink = sourceId && targetId && sourceId !== targetId;

  const handleLink = () => {
    if (!canLink) return;
    linkItems(sourceId, targetId, relType);
    setSaved(true);
    setSourceId('');
    setTargetId('');
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#161A1E] rounded shadow-2xl border border-[#2B2F36] max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] text-[#EAECEF]">
        {/* Header */}
        <div className="p-3 bg-[#0B0E11] text-white flex items-center justify-between border-b border-[#2B2F36]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans">Link Items</h3>
              <p className="text-xs text-gray-400 font-sans">Connect two items (repo → project → client, domain → server…)</p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2B2F36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
          {items.length < 2 ? (
            <div className="text-xs text-gray-400 py-8 text-center leading-relaxed">
              You need at least <span className="text-yellow-400 font-bold">2 items</span> to link.<br />
              Add items with a Type (Repo, Project, Client, Domain, Server, API…) using <span className="text-yellow-400">New Note</span>, then come back here.
            </div>
          ) : (
            <>
              {/* Source */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">From</label>
                <select
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#0B0E11] border border-[#2B2F36] text-white rounded focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select an item…</option>
                  {items.map(n => (
                    <option key={n.id} value={n.id}>{n.title} — {n.itemType}</option>
                  ))}
                </select>
              </div>

              {/* Relationship */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Relationship
                </label>
                <select
                  value={relType}
                  onChange={e => setRelType(e.target.value as RelationshipType)}
                  className="w-full px-2.5 py-2 text-xs bg-[#0B0E11] border border-[#2B2F36] text-white rounded focus:outline-none focus:border-emerald-500"
                >
                  {REL_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Target */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">To</label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#0B0E11] border border-[#2B2F36] text-white rounded focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select an item…</option>
                  {items.map(n => (
                    <option key={n.id} value={n.id}>{n.title} — {n.itemType}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleLink}
                disabled={!canLink}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saved ? '✓ Link created' : 'Create Link'}
              </button>
              <p className="text-[10px] text-gray-500 text-center">The link appears as an edge in your graph and syncs across devices.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
