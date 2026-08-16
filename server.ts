import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { openRouterProvider, OpenRouterError } from './src/services/ai/OpenRouterProvider.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------
// AI Provider Config type (mirrors src/types.ts)
// ---------------------------------------------------------------
interface AIProviderConfig {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  label?: string;
}

// ---------------------------------------------------------------
// Universal AI Router
// Supports: OpenAI, Ollama, Groq, Together, NVIDIA NIM,
//           OpenRouter, Mistral, LM Studio, Custom, Anthropic
// Falls back to OpenRouter SDK for 'openrouter' provider (env-key)
// ---------------------------------------------------------------
async function callAI(
  providerConfig: AIProviderConfig | null,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const cfg = providerConfig;

  // ── OpenRouter path (env-backed) ─────────────────────────────
  // When: (a) no config, (b) openrouter provider, or
  //       (c) openrouter provider but no key entered in UI → env key used automatically
  if (!cfg || cfg.provider === 'openrouter') {
    const apiKey = cfg?.apiKey || undefined; // provider falls back to OPENROUTER_API_KEY env
    const model = cfg?.model || undefined;
    return openRouterProvider.callJSON(systemPrompt, userMessage, apiKey, model);
  }

  // ── Anthropic native API ──────────────────────────────────────
  if (cfg.provider === 'anthropic') {
    const baseUrl = cfg.baseUrl || 'https://api.anthropic.com';
    const resp = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cfg.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: cfg.model || 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Anthropic API error (${resp.status}): ${err}`);
    }
    const data: any = await resp.json();
    return data.content?.[0]?.text?.trim() ?? '{}';
  }

  // ── Gemini (OpenAI-compatible endpoint) ─────────────────────
  if (cfg.provider === 'gemini') {
    const apiKey = cfg.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('No Gemini API key configured. Add one in Settings or set GEMINI_API_KEY in .env');
    }
    const geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';
    const resp = await fetch(`${geminiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: cfg.model || 'gemini-2.5-flash',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Gemini API error (${resp.status}): ${errText}`);
    }
    const data: any = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '{}';
  }

  // ── OpenAI-compatible path (OpenAI, Ollama, Groq, Together,
  //    NVIDIA NIM, Mistral, LM Studio, Custom) ──────────────────
  const baseUrl = cfg.baseUrl?.replace(/\/$/, '');
  if (!baseUrl) throw new Error(`No base URL configured for provider "${cfg.provider}".`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (cfg.apiKey) {
    headers['Authorization'] = `Bearer ${cfg.apiKey}`;
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userMessage }
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`AI API error (${resp.status}) from ${cfg.provider}: ${errText}`);
  }

  const data: any = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '{}';
}

// ---------------------------------------------------------------
// Helper: get provider config from request body or env fallback
// ---------------------------------------------------------------
function getProvider(body: any): AIProviderConfig | null {
  if (body?.providerConfig && body.providerConfig.provider) {
    const cfg = body.providerConfig as AIProviderConfig;

    // If OpenRouter is selected but no key in UI → inject env key
    if (cfg.provider === 'openrouter' && !cfg.apiKey && process.env.OPENROUTER_API_KEY) {
      return {
        ...cfg,
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: cfg.baseUrl || 'https://openrouter.ai/api/v1',
        model: cfg.model || openRouterProvider.model
      };
    }

    return cfg;
  }

  // Legacy: check env vars for a default provider
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: openRouterProvider.model,
      label: 'OpenRouter'
    };
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-2.5-flash',
      label: 'Gemini'
    };
  }
  return null;
}

// ---------------------------------------------------------------
// API Route: Health Check (for Docker + launcher readiness probe)
// ---------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const hasKey = openRouterProvider.hasEnvKey || !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    provider: process.env.OPENROUTER_API_KEY ? 'openrouter' : (process.env.GEMINI_API_KEY ? 'gemini' : 'none'),
    model: openRouterProvider.model,
    keyConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------------------------
// API Route: OpenRouter Models Catalog
// ---------------------------------------------------------------
app.get('/api/openrouter/models', async (req, res) => {
  try {
    const allModels = await openRouterProvider.listModels();
    // Filter to free models (pricing.prompt === "0")
    const freeModels = (allModels as any[]).filter(
      (m: any) =>
        m.pricing?.prompt === '0' ||
        m.pricing?.prompt === 0 ||
        m.id?.endsWith(':free')
    );
    return res.json({ all: allModels, free: freeModels });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch models.' });
  }
});

// ---------------------------------------------------------------
// API Route: Test Connection
// ---------------------------------------------------------------
app.post('/api/test-connection', async (req, res) => {
  try {
    const cfg = req.body.providerConfig as AIProviderConfig;
    if (!cfg?.provider) return res.status(400).json({ success: false, error: 'No provider config supplied.' });

    // For OpenRouter with no UI key, inject env key for the test
    const testCfg: AIProviderConfig = cfg.provider === 'openrouter' && !cfg.apiKey
      ? { ...cfg, apiKey: process.env.OPENROUTER_API_KEY || '' }
      : cfg;

    const result = await callAI(testCfg, 'You are a test agent. Reply with valid JSON only.', 'Say {"ok": true}');
    const parsed = JSON.parse(result);
    if (parsed.ok) return res.json({ success: true, message: `Connected to ${cfg.label || cfg.provider} successfully.` });
    return res.json({ success: true, message: 'Connected. Response received.' });
  } catch (err: any) {
    return res.status(200).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------
// API Route 1: Knowledge Extraction from Note
// ---------------------------------------------------------------
app.post('/api/extract-knowledge', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const cfg = getProvider(req.body);
    if (!cfg) {
      return res.json({
        concepts: [{ id: `c-${Date.now()}-1`, name: title || 'Core Concept', type: 'Concept', description: 'Extracted concept from note content.', confidence: 0.90 }],
        acronyms: [],
        relationships: []
      });
    }

    const systemPrompt = `You are a semantic Knowledge Graph AI. Analyze the following note and extract core concepts, acronyms, and relationships. Always return valid JSON matching exactly the schema provided. Do not include any markdown or explanation outside the JSON object.`;
    const userMessage = `Note Title: ${title || 'Untitled Note'}
Note Content:
${content}

Return a valid JSON object with this exact structure:
{
  "concepts": [
    {
      "name": "Concept Name",
      "type": "Concept",
      "description": "Short 1-sentence definition",
      "category": "Domain category",
      "confidence": 0.9
    }
  ],
  "acronyms": [
    {
      "acronym": "API",
      "expansion": "Application Programming Interface",
      "description": "Brief explanation",
      "category": "Software"
    }
  ],
  "relationships": [
    {
      "sourceName": "Concept A",
      "targetName": "Concept B",
      "relationshipType": "RELATED_TO",
      "score": 0.85,
      "confidence": 0.9,
      "evidence": ["Direct quote from note"],
      "explanation": "Why they are connected",
      "breakdown": {
        "semanticSimilarity": 0.85,
        "sharedConcepts": 0.80,
        "explicitReferences": 0.90,
        "relationshipInference": 0.85,
        "evidenceStrength": 0.90,
        "contextualRelevance": 0.85
      }
    }
  ]
}`;

    const raw = await callAI(cfg, systemPrompt, userMessage);
    const parsed = JSON.parse(raw);

    const concepts = (parsed.concepts || []).map((c: any, i: number) => ({
      id: `c-ext-${Date.now()}-${i}`,
      name: c.name,
      type: c.type || 'Concept',
      description: c.description || '',
      category: c.category || 'General',
      confidence: c.confidence || 0.9
    }));
    const acronyms = (parsed.acronyms || []).map((a: any, i: number) => ({
      id: `a-ext-${Date.now()}-${i}`,
      acronym: a.acronym,
      expansion: a.expansion,
      description: a.description || '',
      category: a.category || 'General'
    }));
    const relationships = (parsed.relationships || []).map((r: any, i: number) => ({
      id: `r-ext-${Date.now()}-${i}`,
      sourceName: r.sourceName,
      targetName: r.targetName,
      relationshipType: r.relationshipType || 'RELATED_TO',
      score: r.score || 0.85,
      confidence: r.confidence || 0.9,
      evidence: r.evidence || [],
      explanation: r.explanation || '',
      breakdown: r.breakdown || { semanticSimilarity: 0.8, sharedConcepts: 0.8, explicitReferences: 0.9, relationshipInference: 0.8, evidenceStrength: 0.85, contextualRelevance: 0.85 }
    }));

    return res.json({ concepts, acronyms, relationships });
  } catch (error: any) {
    console.error('Extraction Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to extract knowledge from note.' });
  }
});

// ---------------------------------------------------------------
// API Route 2: Generate Dynamic Custom Perspective
// ---------------------------------------------------------------
app.post('/api/generate-perspective', async (req, res) => {
  try {
    const { prompt, concepts } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Perspective prompt is required' });

    const cfg = getProvider(req.body);
    if (!cfg) {
      return res.json({
        perspective: {
          id: `custom-${Date.now()}`,
          name: prompt.slice(0, 24),
          description: `Custom perspective based on '${prompt}'`,
          priorityConcepts: concepts ? concepts.slice(0, 5).map((c: any) => c.name) : [],
          color: '#EC4899',
          isCustom: true
        }
      });
    }

    const systemPrompt = `You are a Knowledge Graph Perspective Engine. Return only valid JSON.`;
    const userMessage = `User Perspective Request: "${prompt}"
Available Graph Concepts: ${(concepts || []).map((c: any) => c.name).join(', ')}

Return JSON:
{
  "name": "Short Name",
  "description": "Clear 1-sentence explanation of what this perspective focuses on.",
  "priorityConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "priorityRules": "Brief description of how relationships are weighted in this view.",
  "color": "#F43F5E"
}`;

    const raw = await callAI(cfg, systemPrompt, userMessage);
    const parsed = JSON.parse(raw);

    return res.json({
      perspective: {
        id: `p-custom-${Date.now()}`,
        name: parsed.name || prompt.slice(0, 24),
        description: parsed.description || `Custom perspective for ${prompt}`,
        priorityConcepts: parsed.priorityConcepts || [],
        priorityRules: parsed.priorityRules || '',
        color: parsed.color || '#EC4899',
        isCustom: true
      }
    });
  } catch (error: any) {
    console.error('Perspective Generation Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to generate custom perspective.' });
  }
});

// ---------------------------------------------------------------
// API Route 3: Discover Connections & Knowledge Gaps
// ---------------------------------------------------------------
app.post('/api/discover-connections', async (req, res) => {
  try {
    const { notes, concepts, relationships } = req.body;

    const cfg = getProvider(req.body);
    if (!cfg) {
      return res.json({
        discoveries: [{
          id: `disc-fallback-1`,
          sourceConcept: 'Kernel', targetConcept: 'CUDA', confidence: 0.82,
          why: 'Kernel GPU driver interfaces negotiate DMA buffers for CUDA kernel launches.',
          evidenceNotes: ['Operating System & Kernel Architecture', 'GPU Architecture & Machine Learning Acceleration'],
          suggestedType: 'DEPENDS_ON', status: 'PENDING'
        }],
        knowledgeGaps: [{
          id: `gap-fallback-1`,
          missingConcept: 'System Calls',
          description: 'Trap interface between user space applications and kernel privilege levels.',
          connectedKnownConcepts: ['Kernel', 'Process', 'API'],
          reason: 'Bridge concept missing in user notes.',
          urgency: 'HIGH'
        }]
      });
    }

    const systemPrompt = `You are a Personal Knowledge Graph analysis AI. Return only valid JSON.`;
    const userMessage = `Analyze this Personal Knowledge Graph state:
Existing Concepts: ${JSON.stringify((concepts || []).map((c: any) => c.name))}
Existing Relationships: ${JSON.stringify((relationships || []).map((r: any) => `${r.sourceName} -> ${r.targetName} (${r.relationshipType})`))}
Sample Notes Titles: ${JSON.stringify((notes || []).map((n: any) => n.title))}

Return JSON with up to 3 discoveries and 2 knowledge gaps:
{
  "discoveries": [
    {
      "sourceConcept": "Concept A",
      "targetConcept": "Concept B",
      "confidence": 0.85,
      "why": "Detailed explanation",
      "evidenceNotes": ["Note Title 1"],
      "suggestedType": "DEPENDS_ON"
    }
  ],
  "knowledgeGaps": [
    {
      "missingConcept": "Missing Concept Name",
      "description": "Brief description",
      "connectedKnownConcepts": ["Concept 1", "Concept 2"],
      "reason": "Why learning this strengthens the graph",
      "urgency": "HIGH"
    }
  ]
}`;

    const raw = await callAI(cfg, systemPrompt, userMessage);
    const parsed = JSON.parse(raw);

    const discoveries = (parsed.discoveries || []).map((d: any, i: number) => ({
      id: `disc-gen-${Date.now()}-${i}`,
      sourceConcept: d.sourceConcept, targetConcept: d.targetConcept,
      confidence: d.confidence || 0.85, why: d.why || '',
      evidenceNotes: d.evidenceNotes || [],
      suggestedType: d.suggestedType || 'RELATED_TO', status: 'PENDING'
    }));
    const knowledgeGaps = (parsed.knowledgeGaps || []).map((g: any, i: number) => ({
      id: `gap-gen-${Date.now()}-${i}`,
      missingConcept: g.missingConcept, description: g.description || '',
      connectedKnownConcepts: g.connectedKnownConcepts || [],
      reason: g.reason || '', urgency: g.urgency || 'MEDIUM'
    }));

    return res.json({ discoveries, knowledgeGaps });
  } catch (error: any) {
    console.error('Discovery Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to discover connections.' });
  }
});

// ---------------------------------------------------------------
// API Route 4: Deep Explain Relationship
// ---------------------------------------------------------------
app.post('/api/explain-relationship', async (req, res) => {
  try {
    const { sourceName, targetName, relationshipType, evidenceNotes } = req.body;
    const cfg = getProvider(req.body);
    if (!cfg) {
      return res.json({
        explanation: `${sourceName} and ${targetName} share a structural ${relationshipType} relationship.`,
        evidenceQuotes: evidenceNotes || [],
        breakdown: { semanticSimilarity: 0.85, sharedConcepts: 0.90, explicitReferences: 0.95, relationshipInference: 0.88, evidenceStrength: 0.92, contextualRelevance: 0.90 }
      });
    }

    const systemPrompt = `You are a Knowledge Graph relationship explainer. Return only valid JSON.`;
    const userMessage = `Explain why '${sourceName}' and '${targetName}' are connected with relationship type '${relationshipType}'.
Relevant Notes Content: ${JSON.stringify(evidenceNotes || [])}

Return JSON:
{
  "explanation": "Clear, concise paragraph explaining why they are connected.",
  "rationalePoints": ["Point 1", "Point 2", "Point 3"],
  "evidenceQuotes": ["Quote 1 from notes"],
  "breakdown": {
    "semanticSimilarity": 0.85,
    "sharedConcepts": 0.90,
    "explicitReferences": 0.95,
    "relationshipInference": 0.88,
    "evidenceStrength": 0.92,
    "contextualRelevance": 0.90
  }
}`;

    const raw = await callAI(cfg, systemPrompt, userMessage);
    return res.json(JSON.parse(raw));
  } catch (error: any) {
    console.error('Explain Relationship Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to explain relationship.' });
  }
});

// ---------------------------------------------------------------
// API Route 5: Grounded AI Knowledge Query (Chat Assistant)
// ---------------------------------------------------------------
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { query, notes, concepts, relationships } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const cfg = getProvider(req.body);
    if (!cfg) {
      return res.json({
        answer: `Based on your stored notes, you have documented core principles regarding Operating Systems, Kernel, Docker, CUDA, and Networking. Here is how they connect to your query: "${query}".`,
        sources: [{ noteId: 'note-1', noteTitle: 'Operating System & Kernel Architecture', quote: 'The Kernel directly manages CPU, Memory, and Processes.' }],
        inferences: ['Processes rely on kernel ABI contracts for system call traps.'],
        externalKnowledge: ['Modern OS kernels use ring 0 execution mode for kernel privilege.']
      });
    }

    const systemPrompt = `You are a Grounded Personal Knowledge AI Assistant. Prioritize facts from the user's notes. Return only valid JSON.`;
    const userMessage = `User Query: "${query}"

User's Stored Notes:
${JSON.stringify((notes || []).map((n: any) => ({ id: n.id, title: n.title, content: n.content, collection: n.collection })))}

Extracted Concepts: ${JSON.stringify((concepts || []).map((c: any) => c.name))}
Knowledge Graph Relationships: ${JSON.stringify((relationships || []).map((r: any) => `${r.sourceName} -> ${r.targetName} (${r.relationshipType})`))}

Return JSON:
{
  "answer": "Detailed, markdown-formatted response addressing the user's question.",
  "sources": [{ "noteId": "note-1", "noteTitle": "Title of Note", "quote": "Direct quote from the note" }],
  "inferences": ["Inference drawn by connecting concepts across notes"],
  "externalKnowledge": ["General domain fact added to complete the explanation"]
}`;

    const raw = await callAI(cfg, systemPrompt, userMessage);
    const parsed = JSON.parse(raw);
    return res.json({
      answer: parsed.answer || 'No answer generated.',
      sources: parsed.sources || [],
      inferences: parsed.inferences || [],
      externalKnowledge: parsed.externalKnowledge || []
    });
  } catch (error: any) {
    console.error('Ask AI Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to query AI Assistant.' });
  }
});

// ---------------------------------------------------------------
// API Route 6: Generate Personalized Learning Path
// ---------------------------------------------------------------
app.post('/api/generate-learning-path', async (req, res) => {
  try {
    const { targetDomain, currentConcepts } = req.body;
    const cfg = getProvider(req.body);
    if (!cfg) {
      return res.json({
        learningPath: {
          id: `lp-${Date.now()}`,
          title: `Learning Path: ${targetDomain || 'Systems & AI'}`,
          targetDomain: targetDomain || 'Systems & AI',
          steps: [
            { stepNumber: 1, concept: 'System Calls (Syscalls)', description: 'Understand how user apps request kernel services via traps.', prerequisites: ['Kernel', 'Process', 'ABI'], whyNext: 'Bridges your existing knowledge of API/ABI and Linux Kernel.' },
            { stepNumber: 2, concept: 'Page Faults & Swap', description: 'Master hardware MMU page translation exceptions.', prerequisites: ['Virtual Memory', 'Memory'], whyNext: 'Completes your virtual memory understanding.' }
          ]
        }
      });
    }

    const systemPrompt = `You are a personalized learning path generator. Return only valid JSON.`;
    const userMessage = `Generate a personalized 4-step Learning Path for domain: "${targetDomain || 'Computer Systems and AI'}".
Current concepts the user already knows: ${JSON.stringify(currentConcepts || [])}

Return JSON:
{
  "title": "Learning Path Title",
  "targetDomain": "Target Domain",
  "steps": [
    {
      "stepNumber": 1,
      "concept": "Concept Name",
      "description": "Clear description of what to learn next",
      "prerequisites": ["Known Concept 1"],
      "whyNext": "Why this connects to their existing knowledge"
    }
  ]
}`;

    const raw = await callAI(cfg, systemPrompt, userMessage);
    const parsed = JSON.parse(raw);
    return res.json({
      learningPath: {
        id: `lp-${Date.now()}`,
        title: parsed.title || `Learning Path for ${targetDomain}`,
        targetDomain: targetDomain || 'General',
        steps: parsed.steps || []
      }
    });
  } catch (error: any) {
    console.error('Learning Path Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to generate learning path.' });
  }
});

// ---------------------------------------------------------------
// Vite Integration for Dev / Static Files for Prod
// ---------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const keyStatus = process.env.OPENROUTER_API_KEY
      ? `OpenRouter key loaded (model: ${openRouterProvider.model})`
      : process.env.GEMINI_API_KEY
      ? 'Gemini key loaded'
      : 'No env AI key — configure in Settings UI';

    console.log(`Knowledge Graph AI Server running on http://localhost:${PORT}`);
    console.log(`AI: ${keyStatus}`);
  });
}

startServer();
