import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getState, putState, captureTokenFromUrl, getToken, setToken } from '../lib/api';
import {
  Note,
  NodeType,
  Lane,
  Relationship,
  RelationshipType,
  Perspective,
  DiscoveryConnection,
  KnowledgeGap,
  GraphFilterOptions,
  GraphMode,
  ChatMessage,
  ExtractedConcept,
  ExtractedAcronym,
  LearningPath,
  AIProviderConfig,
  AI_PROVIDER_DEFAULTS
} from '../types';
import {
  INITIAL_NOTES,
  INITIAL_PERSPECTIVES,
  INITIAL_RELATIONSHIPS,
  INITIAL_DISCOVERIES,
  INITIAL_KNOWLEDGE_GAPS
} from '../data/initialNotes';

interface KnowledgeGraphContextType {
  notes: Note[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  relationships: Relationship[];
  perspectives: Perspective[];
  activePerspectiveId: string;
  setActivePerspectiveId: (id: string) => void;
  discoveries: DiscoveryConnection[];
  knowledgeGaps: KnowledgeGap[];
  learningPaths: LearningPath[];
  filters: GraphFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<GraphFilterOptions>>;
  graphMode: GraphMode;
  setGraphMode: (mode: GraphMode) => void;
  
  // Modals / Panels toggles
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedRelationshipId: string | null;
  setSelectedRelationshipId: (id: string | null) => void;
  isAskOpen: boolean;
  setIsAskOpen: (open: boolean) => void;
  isDiscoveryOpen: boolean;
  setIsDiscoveryOpen: (open: boolean) => void;
  isPerspectiveCompareOpen: boolean;
  setIsPerspectiveCompareOpen: (open: boolean) => void;
  comparePerspectiveId: string;
  setComparePerspectiveId: (id: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isConnectOpen: boolean;
  setIsConnectOpen: (open: boolean) => void;

  // Actions
  addNote: (title: string, content: string, collection?: string, tags?: string[], source?: string, itemType?: NodeType, lane?: Lane, sourceUrl?: string, imageUrl?: string) => Promise<Note>;
  extractLearnings: (noteId: string) => Promise<string[]>;
  getProfileInsights: () => Promise<any>;
  linkItems: (sourceNoteId: string, targetNoteId: string, relationshipType: RelationshipType) => void;
  uploadImage: (dataUrl: string) => Promise<string>;
  extractImage: (dataUrl: string) => Promise<any>;
  updateNote: (id: string, title: string, content: string, collection?: string, tags?: string[]) => Promise<void>;
  deleteNote: (id: string) => void;
  reAnalyzeNote: (id: string) => Promise<void>;
  createCustomPerspective: (prompt: string) => Promise<Perspective>;
  confirmRelationship: (relId: string, confirmed: boolean) => void;
  acceptDiscovery: (discoveryId: string) => void;
  rejectDiscovery: (discoveryId: string) => void;
  askAI: (query: string) => Promise<ChatMessage>;
  chatMessages: ChatMessage[];
  generateLearningPath: (domain: string) => Promise<LearningPath>;
  triggerDiscoveryScan: () => Promise<void>;
  resetToDefaults: () => void;
  // AI Provider
  providerConfig: AIProviderConfig;
  setProviderConfig: (cfg: AIProviderConfig) => void;
}

const KnowledgeGraphContext = createContext<KnowledgeGraphContextType | undefined>(undefined);

// Phase 0: one-time access gate shown when the server requires a key this device lacks.
const AccessGate: React.FC = () => {
  const [val, setVal] = useState('');
  const submit = () => {
    let token = val.trim();
    try {
      if (token.includes('key=')) {
        const u = new URL(token);
        token = u.searchParams.get('key') || token;
      }
    } catch { /* treat as raw token */ }
    if (!token) return;
    setToken(token);
    window.location.href = window.location.origin + window.location.pathname;
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f17', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 28 }}>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>🔒 Private Knowledge Hub</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 20px' }}>Paste your access key (or full access link) to unlock this device. You only need to do this once per device.</p>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="access key or link…"
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid #374151', background: '#0b0f17', color: '#e5e7eb', fontSize: 14, marginBottom: 14 }}
        />
        <button onClick={submit} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Unlock</button>
      </div>
    </div>
  );
};

export const KnowledgeGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence via localStorage
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('kg_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);

  const [relationships, setRelationships] = useState<Relationship[]>(() => {
    const saved = localStorage.getItem('kg_relationships');
    return saved ? JSON.parse(saved) : INITIAL_RELATIONSHIPS;
  });

  const [perspectives, setPerspectives] = useState<Perspective[]>(() => {
    const saved = localStorage.getItem('kg_perspectives');
    return saved ? JSON.parse(saved) : INITIAL_PERSPECTIVES;
  });

  const [activePerspectiveId, setActivePerspectiveId] = useState<string>('general');
  const [comparePerspectiveId, setComparePerspectiveId] = useState<string>('security');

  const [discoveries, setDiscoveries] = useState<DiscoveryConnection[]>(() => {
    const saved = localStorage.getItem('kg_discoveries');
    return saved ? JSON.parse(saved) : INITIAL_DISCOVERIES;
  });

  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>(() => {
    const saved = localStorage.getItem('kg_gaps');
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_GAPS;
  });

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  const [graphMode, setGraphMode] = useState<GraphMode>('GLOBAL');

  const [filters, setFilters] = useState<GraphFilterOptions>({
    minScore: 0.5,
    minConfidence: 0.6,
    selectedNodeTypes: ['Concept', 'Entity', 'Acronym', 'Technology', 'Topic'],
    selectedPerspectiveId: 'general',
    searchTerm: '',
    selectedCollection: 'ALL',
    selectedTopic: 'ALL',
    maxDepth: 2,
    focusedNodeId: null,
    showSpeculative: false
  });

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [isAskOpen, setIsAskOpen] = useState<boolean>(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState<boolean>(false);
  const [isPerspectiveCompareOpen, setIsPerspectiveCompareOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isConnectOpen, setIsConnectOpen] = useState<boolean>(false);

  // AI Provider config — persisted in localStorage
  const [providerConfig, setProviderConfigState] = useState<AIProviderConfig>(() => {
    try {
      const saved = localStorage.getItem('kg_provider_config');
      if (saved) return JSON.parse(saved) as AIProviderConfig;
    } catch { /* ignore */ }
    // Default to OpenRouter (env key is loaded server-side automatically)
    return {
      ...AI_PROVIDER_DEFAULTS.openrouter,
      apiKey: '' // key is handled server-side via OPENROUTER_API_KEY env var
    } as AIProviderConfig;
  });

  const setProviderConfig = (cfg: AIProviderConfig) => {
    setProviderConfigState(cfg);
    localStorage.setItem('kg_provider_config', JSON.stringify(cfg));
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: 'Hello! I am your **Knowledge Graph AI Assistant**. Ask me anything about your notes, concepts, or relationship connections.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Phase 0: server-sync state
  const [hydrated, setHydrated] = useState(false);
  const [locked, setLocked] = useState(false);

  // Save changes to localStorage (offline cache)
  useEffect(() => {
    localStorage.setItem('kg_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('kg_relationships', JSON.stringify(relationships));
  }, [relationships]);

  useEffect(() => {
    localStorage.setItem('kg_perspectives', JSON.stringify(perspectives));
  }, [perspectives]);

  useEffect(() => {
    localStorage.setItem('kg_discoveries', JSON.stringify(discoveries));
  }, [discoveries]);

  useEffect(() => {
    localStorage.setItem('kg_gaps', JSON.stringify(knowledgeGaps));
  }, [knowledgeGaps]);

  // Phase 0: hydrate from server on mount, then keep it synced
  useEffect(() => {
    let cancelled = false;
    (async () => {
      captureTokenFromUrl();
      try {
        const health = await fetch('/api/health').then(r => r.json());
        if (!cancelled && health?.authRequired && !getToken()) { setLocked(true); return; }
      } catch { /* offline: fall back to local cache */ }

      try {
        const state = await getState();
        if (cancelled) return;
        if (state && !state.empty && Array.isArray(state.notes)) {
          setNotes(state.notes);
          setRelationships(Array.isArray(state.relationships) ? state.relationships : []);
          if (Array.isArray(state.perspectives) && state.perspectives.length) setPerspectives(state.perspectives);
          setDiscoveries(Array.isArray(state.discoveries) ? state.discoveries : []);
          setKnowledgeGaps(Array.isArray(state.knowledgeGaps) ? state.knowledgeGaps : []);
          setActiveNoteId(state.notes[0]?.id ?? null);
        } else {
          // Server empty → migrate whatever this browser already has (local cache or seeds)
          await putState({ notes, relationships, perspectives, discoveries, knowledgeGaps });
        }
      } catch (e: any) {
        if (!cancelled && e?.status === 401) { setLocked(true); return; }
        console.error('State hydration failed:', e);
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 0: debounced save to server after hydration
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      putState({ notes, relationships, perspectives, discoveries, knowledgeGaps }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [hydrated, notes, relationships, perspectives, discoveries, knowledgeGaps]);

  // Actions
  const addNote = async (
    title: string,
    content: string,
    collection: string = 'General',
    tags: string[] = [],
    source: string = 'Manual Note',
    itemType: NodeType = 'Note',
    lane: Lane = 'inbox',
    sourceUrl?: string,
    imageUrl?: string
  ): Promise<Note> => {
    const newNoteId = `note-${Date.now()}`;
    const initialNote: Note = {
      id: newNoteId,
      title: title || 'Untitled Note',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
      sourceUrl,
      itemType,
      lane,
      imageUrl,
      tags: tags.length ? tags : ['note'],
      collection,
      processingStatus: 'PROCESSING',
      concepts: [],
      acronyms: []
    };

    setNotes(prev => [initialNote, ...prev]);
    setActiveNoteId(newNoteId);

    // Trigger AI extraction
    try {
      const res = await apiFetch('/api/extract-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, providerConfig })
      });

      if (!res.ok) throw new Error('Failed AI extraction response');
      const data = await res.json();

      const extractedConcepts: ExtractedConcept[] = data.concepts || [];
      const extractedAcronyms: ExtractedAcronym[] = data.acronyms || [];
      const extractedRels = data.relationships || [];

      // Update note status
      setNotes(prev => prev.map(n => {
        if (n.id === newNoteId) {
          return {
            ...n,
            processingStatus: 'COMPLETED',
            concepts: extractedConcepts,
            acronyms: extractedAcronyms
          };
        }
        return n;
      }));

      // Merge new relationships
      const newRels: Relationship[] = extractedRels.map((r: any, idx: number) => ({
        id: `rel-${Date.now()}-${idx}`,
        sourceId: `c-${r.sourceName.toLowerCase().replace(/\s+/g, '-')}`,
        targetId: `c-${r.targetName.toLowerCase().replace(/\s+/g, '-')}`,
        sourceName: r.sourceName,
        targetName: r.targetName,
        relationshipType: r.relationshipType,
        baseScore: r.score || 0.85,
        confidence: r.confidence || 0.9,
        evidence: r.evidence || [content.slice(0, 100)],
        sourceNoteIds: [newNoteId],
        explanation: r.explanation,
        breakdown: r.breakdown,
        userConfirmed: null,
        createdAt: new Date().toISOString()
      }));

      setRelationships(prev => [...newRels, ...prev]);

      return {
        ...initialNote,
        processingStatus: 'COMPLETED',
        concepts: extractedConcepts,
        acronyms: extractedAcronyms
      };
    } catch (err) {
      console.error('Error adding note:', err);
      setNotes(prev => prev.map(n => n.id === newNoteId ? { ...n, processingStatus: 'FAILED' } : n));
      return initialNote;
    }
  };

  const updateNote = async (
    id: string,
    title: string,
    content: string,
    collection?: string,
    tags?: string[]
  ) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          title,
          content,
          collection: collection || n.collection,
          tags: tags || n.tags,
          updatedAt: new Date().toISOString(),
          processingStatus: 'PROCESSING'
        };
      }
      return n;
    }));

    try {
      const res = await apiFetch('/api/extract-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, providerConfig })
      });

      if (!res.ok) throw new Error('Extraction error');
      const data = await res.json();

      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            processingStatus: 'COMPLETED',
            concepts: data.concepts || [],
            acronyms: data.acronyms || []
          };
        }
        return n;
      }));
    } catch (err) {
      console.error('Update Note re-extract error:', err);
      setNotes(prev => prev.map(n => n.id === id ? { ...n, processingStatus: 'FAILED' } : n));
    }
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Phase 1: Learn-as-you-go — pull atomic learnings out of a note and save each as a Learning item.
  const extractLearnings = async (noteId: string): Promise<string[]> => {
    const sourceNote = notes.find(n => n.id === noteId);
    if (!sourceNote) return [];
    try {
      const res = await apiFetch('/api/extract-learnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sourceNote.title, content: sourceNote.content, providerConfig })
      });
      if (!res.ok) throw new Error('Failed to extract learnings');
      const data = await res.json();
      const learnings: string[] = Array.isArray(data.learnings) ? data.learnings : [];
      if (learnings.length === 0) return [];

      const learningNotes: Note[] = learnings.map((text, i) => ({
        id: `note-learn-${Date.now()}-${i}`,
        title: text.length > 80 ? text.slice(0, 80) + '…' : text,
        content: text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: `Learned from: ${sourceNote.title}`,
        itemType: 'Learning',
        lane: 'learning',
        tags: ['learning', sourceNote.title],
        collection: 'Learnings',
        processingStatus: 'COMPLETED',
        concepts: [],
        acronyms: []
      }));

      // Phase 2: connect each learning to its source project (by title) so it shows in the graph
      const learningRels: Relationship[] = learningNotes.map((ln, i) => ({
        id: `rel-learn-${Date.now()}-${i}`,
        sourceId: ln.id,
        targetId: sourceNote.id,
        sourceName: ln.title,
        targetName: sourceNote.title,
        relationshipType: 'LEARNED_FROM',
        baseScore: 1,
        confidence: 1,
        evidence: ['Learned from project'],
        sourceNoteIds: [sourceNote.id],
        userConfirmed: true,
        createdAt: new Date().toISOString()
      }));

      setNotes(prev => [...learningNotes, ...prev]);
      setRelationships(prev => [...learningRels, ...prev]);
      return learnings;
    } catch (err) {
      console.error('Extract learnings error:', err);
      return [];
    }
  };

  // Phase 2: manually link two hub items with a typed relationship (renders as a graph edge).
  const linkItems = (sourceNoteId: string, targetNoteId: string, relationshipType: RelationshipType): void => {
    const src = notes.find(n => n.id === sourceNoteId);
    const tgt = notes.find(n => n.id === targetNoteId);
    if (!src || !tgt || src.id === tgt.id) return;
    const rel: Relationship = {
      id: `rel-link-${Date.now()}`,
      sourceId: src.id,
      targetId: tgt.id,
      sourceName: src.title,
      targetName: tgt.title,
      relationshipType,
      baseScore: 1,
      confidence: 1,
      evidence: ['Manual link'],
      sourceNoteIds: [src.id, tgt.id],
      userConfirmed: true,
      createdAt: new Date().toISOString()
    };
    setRelationships(prev => [rel, ...prev]);
  };

  // Phase 3: upload a screenshot to the server (stored as a file), returns its /api/uploads path.
  const uploadImage = async (dataUrl: string): Promise<string> => {
    const res = await apiFetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl })
    });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.url as string;
  };

  // Phase 3: best-effort AI read of a screenshot -> { title, description, tags, text, error? }.
  const extractImage = async (dataUrl: string): Promise<any> => {
    const res = await apiFetch('/api/extract-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, providerConfig })
    });
    if (!res.ok) throw new Error('Image read failed');
    return res.json();
  };

  // Phase 1: the system learns about YOU — a portrait built from your whole graph.
  const getProfileInsights = async (): Promise<any> => {
    const allConcepts = notes.flatMap(n => n.concepts);
    const res = await apiFetch('/api/profile-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, concepts: allConcepts, relationships, providerConfig })
    });
    if (!res.ok) throw new Error('Failed to load profile insights');
    return res.json();
  };

  const reAnalyzeNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await updateNote(id, note.title, note.content, note.collection, note.tags);
  };

  const createCustomPerspective = async (prompt: string): Promise<Perspective> => {
    const allConcepts = notes.flatMap(n => n.concepts);
    const res = await apiFetch('/api/generate-perspective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, concepts: allConcepts, providerConfig })
    });

    if (!res.ok) throw new Error('Failed to generate custom perspective');
    const data = await res.json();
    const newPerspective: Perspective = data.perspective;

    setPerspectives(prev => [...prev, newPerspective]);
    setActivePerspectiveId(newPerspective.id);
    return newPerspective;
  };

  const confirmRelationship = (relId: string, confirmed: boolean) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, userConfirmed: confirmed } : r));
  };

  const acceptDiscovery = (discoveryId: string) => {
    const disc = discoveries.find(d => d.id === discoveryId);
    if (disc) {
      // Add as official relationship
      const newRel: Relationship = {
        id: `rel-disc-${Date.now()}`,
        sourceId: `c-${disc.sourceConcept.toLowerCase().replace(/\s+/g, '-')}`,
        targetId: `c-${disc.targetConcept.toLowerCase().replace(/\s+/g, '-')}`,
        sourceName: disc.sourceConcept,
        targetName: disc.targetConcept,
        relationshipType: disc.suggestedType,
        baseScore: disc.confidence,
        confidence: disc.confidence,
        evidence: [disc.why],
        sourceNoteIds: [],
        explanation: disc.why,
        userConfirmed: true,
        createdAt: new Date().toISOString()
      };
      setRelationships(prev => [newRel, ...prev]);
    }
    setDiscoveries(prev => prev.map(d => d.id === discoveryId ? { ...d, status: 'ACCEPTED' } : d));
  };

  const rejectDiscovery = (discoveryId: string) => {
    setDiscoveries(prev => prev.map(d => d.id === discoveryId ? { ...d, status: 'REJECTED' } : d));
  };

  const askAI = async (query: string): Promise<ChatMessage> => {
    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    const allConcepts = notes.flatMap(n => n.concepts);

    try {
      const res = await apiFetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          notes,
          concepts: allConcepts,
          relationships,
          providerConfig
        })
      });

      if (!res.ok) throw new Error('Ask AI failed');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'No answer generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        inferences: data.inferences || [],
        externalKnowledge: data.externalKnowledge || []
      };

      setChatMessages(prev => [...prev, aiMsg]);
      return aiMsg;
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `m-ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, I encountered an issue retrieving information: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
      return errorMsg;
    }
  };

  const generateLearningPath = async (domain: string): Promise<LearningPath> => {
    const allConcepts = notes.flatMap(n => n.concepts).map(c => c.name);
    const res = await apiFetch('/api/generate-learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetDomain: domain, currentConcepts: allConcepts, providerConfig })
    });

    if (!res.ok) throw new Error('Failed to generate learning path');
    const data = await res.json();
    const pathObj: LearningPath = data.learningPath;
    setLearningPaths(prev => [pathObj, ...prev]);
    return pathObj;
  };

  const triggerDiscoveryScan = async () => {
    const allConcepts = notes.flatMap(n => n.concepts);
    try {
      const res = await apiFetch('/api/discover-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, concepts: allConcepts, relationships, providerConfig })
      });
      if (!res.ok) throw new Error('Discovery scan failed');
      const data = await res.json();
      if (data.discoveries && data.discoveries.length > 0) {
        setDiscoveries(prev => [...data.discoveries, ...prev]);
      }
      if (data.knowledgeGaps && data.knowledgeGaps.length > 0) {
        setKnowledgeGaps(prev => [...data.knowledgeGaps, ...prev]);
      }
    } catch (err) {
      console.error('Trigger discovery error:', err);
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem('kg_notes');
    localStorage.removeItem('kg_relationships');
    localStorage.removeItem('kg_perspectives');
    localStorage.removeItem('kg_discoveries');
    localStorage.removeItem('kg_gaps');

    setNotes(INITIAL_NOTES);
    setActiveNoteId(INITIAL_NOTES[0].id);
    setRelationships(INITIAL_RELATIONSHIPS);
    setPerspectives(INITIAL_PERSPECTIVES);
    setActivePerspectiveId('general');
    setDiscoveries(INITIAL_DISCOVERIES);
    setKnowledgeGaps(INITIAL_KNOWLEDGE_GAPS);
  };

  if (locked) return <AccessGate />;

  return (
    <KnowledgeGraphContext.Provider
      value={{
        notes,
        activeNoteId,
        setActiveNoteId,
        relationships,
        perspectives,
        activePerspectiveId,
        setActivePerspectiveId,
        discoveries,
        knowledgeGaps,
        learningPaths,
        filters,
        setFilters,
        graphMode,
        setGraphMode,
        selectedNodeId,
        setSelectedNodeId,
        selectedRelationshipId,
        setSelectedRelationshipId,
        isAskOpen,
        setIsAskOpen,
        isDiscoveryOpen,
        setIsDiscoveryOpen,
        isPerspectiveCompareOpen,
        setIsPerspectiveCompareOpen,
        comparePerspectiveId,
        setComparePerspectiveId,
        isSettingsOpen,
        setIsSettingsOpen,
        isProfileOpen,
        setIsProfileOpen,
        isConnectOpen,
        setIsConnectOpen,
        addNote,
        extractLearnings,
        getProfileInsights,
        linkItems,
        uploadImage,
        extractImage,
        updateNote,
        deleteNote,
        reAnalyzeNote,
        createCustomPerspective,
        confirmRelationship,
        acceptDiscovery,
        rejectDiscovery,
        askAI,
        chatMessages,
        generateLearningPath,
        triggerDiscoveryScan,
        resetToDefaults,
        providerConfig,
        setProviderConfig
      }}
    >
      {children}
    </KnowledgeGraphContext.Provider>
  );
};

export const useKnowledgeGraph = () => {
  const context = useContext(KnowledgeGraphContext);
  if (!context) {
    throw new Error('useKnowledgeGraph must be used within KnowledgeGraphProvider');
  }
  return context;
};
