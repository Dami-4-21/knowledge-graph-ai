import React, { useState } from 'react';
import {
  X, BarChart2, Download, RefreshCw, Cpu, Key, Link,
  CheckCircle, XCircle, Loader, Settings, Database, Zap, Globe
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';
import { apiFetch } from '../lib/api';
import { AIProviderType, AIProviderConfig, AI_PROVIDER_DEFAULTS } from '../types';

type Tab = 'stats' | 'ai';

const PROVIDER_ICONS: Record<AIProviderType, string> = {
  gemini:     '✦',
  openai:     '⊙',
  ollama:     '◈',
  nvidia:     '⬡',
  groq:       '⚡',
  together:   '⊕',
  openrouter: '⊗',
  anthropic:  '◉',
  mistral:    '◎',
  lmstudio:   '◧',
  custom:     '⊞',
};

const PROVIDER_COLORS: Record<AIProviderType, string> = {
  gemini:     '#4285F4',
  openai:     '#10A37F',
  ollama:     '#F97316',
  nvidia:     '#76B900',
  groq:       '#F9A825',
  together:   '#EC4899',
  openrouter: '#A78BFA',
  anthropic:  '#D97706',
  mistral:    '#3B82F6',
  lmstudio:   '#6366F1',
  custom:     '#64748B',
};

type TestState = 'idle' | 'loading' | 'success' | 'fail';

export const SettingsStatsModal: React.FC = () => {
  const {
    isSettingsOpen, setIsSettingsOpen,
    notes, relationships, perspectives, resetToDefaults,
    providerConfig, setProviderConfig
  } = useKnowledgeGraph();

  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [localCfg, setLocalCfg] = useState<AIProviderConfig>({ ...providerConfig });
  const [testState, setTestState] = useState<TestState>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const [freeModels, setFreeModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showModels, setShowModels] = useState(false);

  if (!isSettingsOpen) return null;

  // Stats calculations
  const nodeConnections: Record<string, number> = {};
  relationships.forEach(r => {
    nodeConnections[r.sourceName] = (nodeConnections[r.sourceName] || 0) + 1;
    nodeConnections[r.targetName] = (nodeConnections[r.targetName] || 0) + 1;
  });
  const sortedHubs = Object.entries(nodeConnections).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalConcepts = Array.from(new Set(notes.flatMap(n => n.concepts.map(c => c.name)))).length;
  const totalAcronyms = Array.from(new Set(notes.flatMap(n => n.acronyms.map(a => a.acronym)))).length;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ notes, relationships, perspectives }, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `knowledge_graph_export_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleProviderSelect = (p: AIProviderType) => {
    const defaults = AI_PROVIDER_DEFAULTS[p];
    setLocalCfg(prev => ({
      ...defaults,
      apiKey: prev.provider === p ? prev.apiKey : '',
    }));
    setTestState('idle');
    setTestMessage('');
    setSaved(false);
  };

  const handleTestConnection = async () => {
    setTestState('loading');
    setTestMessage('');
    try {
      const res = await apiFetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerConfig: localCfg })
      });
      const data = await res.json();
      if (data.success) {
        setTestState('success');
        setTestMessage(data.message || 'Connection successful!');
      } else {
        setTestState('fail');
        setTestMessage(data.error || 'Connection failed.');
      }
    } catch (err: any) {
      setTestState('fail');
      setTestMessage(err.message || 'Request failed.');
    }
  };

  const handleSave = () => {
    setProviderConfig(localCfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFetchFreeModels = async () => {
    setLoadingModels(true);
    setShowModels(true);
    try {
      const res = await apiFetch('/api/openrouter/models');
      const data = await res.json();
      setFreeModels(data.free || []);
    } catch {
      setFreeModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSelectFreeModel = (modelId: string) => {
    setLocalCfg(prev => ({ ...prev, model: modelId }));
    setShowModels(false);
  };

  const accentColor = PROVIDER_COLORS[localCfg.provider] || '#EAB308';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-mono">
      <div className="bg-[#0F1218] rounded-xl shadow-2xl border border-[#2B2F36] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] text-[#EAECEF]">

        {/* Header */}
        <div className="px-4 py-3 bg-[#0B0E11] border-b border-[#2B2F36] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded" style={{ background: `${accentColor}22`, color: accentColor }}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-tight">Settings & Analytics</h3>
              <p className="text-[10px] text-gray-500">
                Active provider:&nbsp;
                <span className="font-bold" style={{ color: accentColor }}>
                  {providerConfig.label || providerConfig.provider}
                </span>
                {providerConfig.model && (
                  <span className="text-gray-600 ml-1">/ {providerConfig.model}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2B2F36] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2B2F36] bg-[#0B0E11] text-xs font-bold">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors ${activeTab === 'ai' ? 'text-white border-b-2' : 'text-gray-500 hover:text-gray-300'}`}
            style={activeTab === 'ai' ? { borderColor: accentColor } : {}}
          >
            <Cpu className="w-3.5 h-3.5" /> AI Provider
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors ${activeTab === 'stats' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Analytics
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1">

          {/* ── AI PROVIDER TAB ───────────────────────────────────── */}
          {activeTab === 'ai' && (
            <div className="p-4 space-y-4 text-xs">

              {/* Provider Picker Grid */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Select Provider</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(AI_PROVIDER_DEFAULTS) as AIProviderType[]).map(p => {
                    const def = AI_PROVIDER_DEFAULTS[p];
                    const isActive = localCfg.provider === p;
                    const color = PROVIDER_COLORS[p];
                    return (
                      <button
                        key={p}
                        onClick={() => handleProviderSelect(p)}
                        className={`relative p-2.5 rounded-lg border text-left transition-all group ${
                          isActive
                            ? 'border-opacity-80 bg-opacity-10'
                            : 'border-[#2B2F36] bg-[#161A1E] hover:border-[#3E434B] hover:bg-[#1E2329]'
                        }`}
                        style={isActive ? { borderColor: color, background: `${color}18` } : {}}
                      >
                        <span className="text-base leading-none block" style={{ color: isActive ? color : '#6B7280' }}>
                          {PROVIDER_ICONS[p]}
                        </span>
                        <span className={`block text-[10px] font-bold mt-1 leading-tight ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                          {def.label.replace(' (Local)', '')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

                {/* Config Fields */}
              <div className="space-y-3 pt-1">
                {/* Base URL */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                    <Link className="w-3 h-3" /> Base URL
                    {(localCfg.provider === 'ollama' || localCfg.provider === 'lmstudio') && (
                      <span className="ml-auto text-green-500 font-normal normal-case text-[10px]">● Local — no key required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={localCfg.baseUrl}
                    onChange={e => setLocalCfg(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://api.example.com/v1"
                    className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3E434B] placeholder-gray-600 font-mono"
                  />
                </div>

                {/* API Key */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3" /> API Key
                    {(localCfg.provider === 'ollama' || localCfg.provider === 'lmstudio') && (
                      <span className="ml-2 text-gray-600 font-normal normal-case">(optional)</span>
                    )}
                  </label>

                  {/* OpenRouter env-key notice */}
                  {localCfg.provider === 'openrouter' && (
                    <div className="mb-2 flex items-start gap-2 px-2.5 py-2 rounded border border-violet-700/40 bg-violet-950/30 text-[10px] text-violet-300">
                      <Zap className="w-3 h-3 mt-0.5 shrink-0 text-violet-400" />
                      <span>
                        Server-side key is loaded from <code className="text-violet-200">.env</code> automatically.
                        Leave the field below empty to use it, or enter a different key to override.
                      </span>
                    </div>
                  )}

                  <input
                    type="password"
                    value={localCfg.apiKey}
                    onChange={e => setLocalCfg(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder={
                      localCfg.provider === 'ollama' || localCfg.provider === 'lmstudio'
                        ? 'No key needed for local models'
                        : localCfg.provider === 'openrouter'
                        ? 'Leave empty to use server OPENROUTER_API_KEY'
                        : 'sk-••••••••••••••••••••'
                    }
                    className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3E434B] placeholder-gray-600 font-mono"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Model</label>
                  <input
                    type="text"
                    value={localCfg.model}
                    onChange={e => setLocalCfg(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="model-name"
                    className="w-full bg-[#161A1E] border border-[#2B2F36] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3E434B] placeholder-gray-600 font-mono"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Default: <code className="text-gray-400">{AI_PROVIDER_DEFAULTS[localCfg.provider]?.model}</code></p>
                </div>

                {/* Free Models Browser (OpenRouter only) */}
                {localCfg.provider === 'openrouter' && (
                  <div>
                    <button
                      onClick={handleFetchFreeModels}
                      disabled={loadingModels}
                      className="w-full py-1.5 px-3 rounded border border-[#3E434B] bg-[#161A1E] hover:bg-[#1E2329] text-[10px] font-bold text-violet-300 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {loadingModels ? (
                        <><Loader className="w-3 h-3 animate-spin" /> Fetching free models…</>
                      ) : (
                        <><Globe className="w-3 h-3" /> Browse Free OpenRouter Models</>
                      )}
                    </button>

                    {showModels && !loadingModels && (
                      <div className="mt-2 max-h-36 overflow-y-auto no-scrollbar rounded border border-[#2B2F36] bg-[#0B0E11]">
                        {freeModels.length === 0 ? (
                          <p className="text-[10px] text-gray-500 text-center py-3">No free models found. Check your key or try again.</p>
                        ) : (
                          freeModels.map((m: any) => (
                            <button
                              key={m.id}
                              onClick={() => handleSelectFreeModel(m.id)}
                              className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#161A1E] border-b border-[#1E2329] last:border-0 transition-colors"
                            >
                              <span className="text-white font-mono">{m.id}</span>
                              {m.name && m.name !== m.id && (
                                <span className="text-gray-500 ml-1.5">— {m.name}</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Test + Status */}
              <div className="space-y-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testState === 'loading'}
                  className="w-full py-2 px-3 rounded border text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}11` }}
                >
                  {testState === 'loading' ? (
                    <><Loader className="w-3.5 h-3.5 animate-spin" /> Testing connection…</>
                  ) : (
                    <><Link className="w-3.5 h-3.5" /> Test Connection</>
                  )}
                </button>

                {testState !== 'idle' && testState !== 'loading' && (
                  <div className={`flex items-start gap-2 p-2.5 rounded border text-[11px] ${
                    testState === 'success'
                      ? 'bg-green-950/40 border-green-800/50 text-green-300'
                      : 'bg-red-950/40 border-red-800/50 text-red-300'
                  }`}>
                    {testState === 'success'
                      ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-400" />
                      : <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />
                    }
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className={`w-full py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {saved ? '✓ Saved!' : 'Save Provider Settings'}
              </button>

              {/* Quick guide */}
              <div className="pt-1 border-t border-[#2B2F36]">
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {localCfg.provider === 'ollama' && '→ Start Ollama: brew install ollama && ollama run llama3.2'}
                  {localCfg.provider === 'lmstudio' && '→ Open LM Studio → Local Server tab → Start server on port 1234'}
                  {localCfg.provider === 'nvidia' && '→ Get your NVIDIA NIM API key at build.nvidia.com'}
                  {localCfg.provider === 'gemini' && '→ Get your Gemini API key at aistudio.google.com or set GEMINI_API_KEY in .env'}
                  {localCfg.provider === 'groq' && '→ Free and fast. Get key at console.groq.com'}
                  {localCfg.provider === 'openrouter' && '→ Access 200+ models via one key at openrouter.ai'}
                  {(localCfg.provider === 'openai' || localCfg.provider === 'anthropic' || localCfg.provider === 'mistral' || localCfg.provider === 'together' || localCfg.provider === 'custom') && '→ Paste your API key above and click Test Connection to verify.'}
                </p>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ─────────────────────────────────────── */}
          {activeTab === 'stats' && (
            <div className="p-4 space-y-4 text-xs">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Notes', value: notes.length, color: 'text-yellow-400' },
                  { label: 'Concepts', value: totalConcepts, color: 'text-green-400' },
                  { label: 'Acronyms', value: totalAcronyms, color: 'text-orange-400' },
                  { label: 'Links', value: relationships.length, color: 'text-purple-400' },
                ].map(m => (
                  <div key={m.label} className="p-3 bg-[#161A1E] border border-[#2B2F36] rounded-lg text-center">
                    <span className={`text-2xl font-extrabold ${m.color}`}>{m.value}</span>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase mt-0.5">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Knowledge Hubs */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> Knowledge Hubs
                </h4>
                <div className="space-y-1.5">
                  {sortedHubs.length === 0 && (
                    <p className="text-gray-600 text-center py-3">No relationships yet.</p>
                  )}
                  {sortedHubs.map(([name, count], i) => (
                    <div key={name} className="p-2.5 bg-[#161A1E] border border-[#2B2F36] rounded-lg flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-2 font-sans text-xs">
                        <span className="w-5 h-5 rounded bg-yellow-500/15 text-yellow-400 font-extrabold text-[10px] flex items-center justify-center border border-yellow-500/25 font-mono">
                          #{i + 1}
                        </span>
                        {name}
                      </span>
                      <span className="text-yellow-400 font-mono font-bold text-[11px]">{count} links</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Actions */}
              <div className="pt-2 border-t border-[#2B2F36] space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Data Controls</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 py-2 px-3 bg-[#161A1E] hover:bg-[#2B2F36] text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#2B2F36]"
                  >
                    <Download className="w-3.5 h-3.5 text-yellow-400" /> Export JSON
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Reset knowledge graph to default sample notes?')) {
                        resetToDefaults();
                        setIsSettingsOpen(false);
                      }
                    }}
                    className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
