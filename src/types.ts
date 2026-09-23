export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type NodeType =
  | 'Concept' | 'Entity' | 'Acronym' | 'Topic' | 'Technology' | 'Note'
  // Phase 1: hub item types
  | 'Repo' | 'Screenshot' | 'Project' | 'Client' | 'Domain' | 'DnsRecord'
  | 'Server' | 'Service' | 'Vision' | 'Learning';

// Phase 1: lanes to separate learning / testing / real client work
export type Lane = 'learning' | 'testing' | 'client' | 'inbox';

export type RelationshipType = 
  | 'RELATED_TO'
  | 'DEPENDS_ON'
  | 'PART_OF'
  | 'IS_A'
  | 'USED_BY'
  | 'IMPLEMENTS'
  | 'CAUSES'
  | 'REQUIRES'
  | 'SIMILAR_TO'
  | 'DERIVED_FROM'
  | 'MENTIONED_IN'
  | 'EXPLAINS'
  | 'CONTRADICTS'
  | 'EXTENDS';

export interface ExtractedConcept {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  category?: string;
  confidence: number;
}

export interface ExtractedAcronym {
  id: string;
  acronym: string;
  expansion: string;
  description: string;
  category?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO date or display string
  updatedAt: string;
  source?: string;
  sourceUrl?: string;
  itemType?: NodeType; // Phase 1: what kind of thing this is (Repo, Project, Client, ...)
  lane?: Lane;         // Phase 1: learning / testing / client / inbox
  tags: string[];
  collection: string;
  processingStatus: ProcessingStatus;
  concepts: ExtractedConcept[];
  acronyms: ExtractedAcronym[];
}

export interface RelationshipScoreBreakdown {
  semanticSimilarity: number;  // 20%
  sharedConcepts: number;      // 15%
  explicitReferences: number;  // 20%
  relationshipInference: number; // 20%
  evidenceStrength: number;    // 15%
  contextualRelevance: number; // 10%
}

export interface Relationship {
  id: string;
  sourceId: string; // concept or note ID/name
  targetId: string;
  sourceName: string;
  targetName: string;
  relationshipType: RelationshipType;
  baseScore: number; // 0.0 - 1.0
  confidence: number; // 0.0 - 1.0
  evidence: string[]; // Quotes from notes
  sourceNoteIds: string[];
  explanation?: string;
  breakdown?: RelationshipScoreBreakdown;
  userConfirmed?: boolean | null; // true = confirmed, false = rejected, null = unconfirmed
  createdAt: string;
}

export interface Perspective {
  id: string;
  name: string;
  description: string;
  priorityConcepts: string[];
  isCustom?: boolean;
  priorityRules?: string;
  color?: string;
}

export interface PerspectiveScore {
  relationshipId: string;
  perspectiveId: string;
  score: number; // 0.0 - 1.0
  reason?: string;
}

export interface DiscoveryConnection {
  id: string;
  sourceConcept: string;
  targetConcept: string;
  confidence: number;
  why: string;
  evidenceNotes: string[];
  suggestedType: RelationshipType;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface KnowledgeGap {
  id: string;
  missingConcept: string;
  description: string;
  connectedKnownConcepts: string[];
  reason: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface LearningPathStep {
  stepNumber: number;
  concept: string;
  description: string;
  prerequisites: string[];
  whyNext: string;
}

export interface LearningPath {
  id: string;
  title: string;
  targetDomain: string;
  steps: LearningPathStep[];
}

export interface GroundedEvidence {
  noteId: string;
  noteTitle: string;
  quote: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: GroundedEvidence[];
  inferences?: string[];
  externalKnowledge?: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  importance: number; // calculated degree or score
  sourceCount: number;
  sourceNoteIds: string[];
  category?: string;
  cluster?: number; // Community detection cluster ID
  pagerank?: number; // PageRank centrality score
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  relationshipType: RelationshipType;
  baseScore: number;
  weightedScore: number; // adjusted by active perspective
  confidence: number;
  evidence: string[];
  sourceNoteIds: string[];
  explanation?: string;
  userConfirmed?: boolean | null;
}

export type GraphMode = 
  | 'GLOBAL'
  | 'TOPIC'
  | 'PERSPECTIVE'
  | 'TIMELINE'
  | 'DISCOVERY'
  | 'NEIGHBORHOOD';

export interface GraphFilterOptions {
  minScore: number; // 0.0 - 1.0
  minConfidence: number; // 0.0 - 1.0
  selectedNodeTypes: NodeType[];
  selectedPerspectiveId: string;
  searchTerm: string;
  selectedCollection: string;
  selectedTopic: string;
  maxDepth: number; // for neighborhood view
  focusedNodeId: string | null;
  showSpeculative: boolean; // scores < 0.5
}

export type AIProviderType =
  | 'gemini'
  | 'openai'
  | 'ollama'
  | 'nvidia'
  | 'groq'
  | 'together'
  | 'openrouter'
  | 'anthropic'
  | 'mistral'
  | 'lmstudio'
  | 'custom';

export interface AIProviderConfig {
  provider: AIProviderType;
  baseUrl: string;
  apiKey: string;
  model: string;
  label: string; // Display label
}

export const AI_PROVIDER_DEFAULTS: Record<AIProviderType, Omit<AIProviderConfig, 'apiKey'>> = {
  gemini:     { provider: 'gemini',     baseUrl: 'https://generativelanguage.googleapis.com', model: 'gemini-2.5-flash', label: 'Google Gemini' },
  openai:     { provider: 'openai',     baseUrl: 'https://api.openai.com/v1',                  model: 'gpt-4o-mini',       label: 'OpenAI' },
  ollama:     { provider: 'ollama',     baseUrl: 'http://localhost:11434/v1',                   model: 'llama3.2',          label: 'Ollama (Local)' },
  nvidia:     { provider: 'nvidia',     baseUrl: 'https://integrate.api.nvidia.com/v1',         model: 'meta/llama-3.1-8b-instruct', label: 'NVIDIA NIM' },
  groq:       { provider: 'groq',       baseUrl: 'https://api.groq.com/openai/v1',              model: 'llama-3.1-8b-instant',  label: 'Groq' },
  together:   { provider: 'together',   baseUrl: 'https://api.together.xyz/v1',                 model: 'meta-llama/Llama-3-8b-chat-hf', label: 'Together AI' },
  openrouter: { provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1',                model: 'openrouter/auto', label: 'OpenRouter' },
  anthropic:  { provider: 'anthropic',  baseUrl: 'https://api.anthropic.com/v1',                model: 'claude-3-5-haiku-20241022', label: 'Anthropic Claude' },
  mistral:    { provider: 'mistral',    baseUrl: 'https://api.mistral.ai/v1',                   model: 'mistral-small-latest', label: 'Mistral AI' },
  lmstudio:  { provider: 'lmstudio',   baseUrl: 'http://localhost:1234/v1',                    model: 'local-model',       label: 'LM Studio' },
  custom:     { provider: 'custom',     baseUrl: '',                                             model: '',                  label: 'Custom / OpenAI-Compatible' },
};
