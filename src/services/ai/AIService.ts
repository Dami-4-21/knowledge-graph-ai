/**
 * AIService
 *
 * Thin orchestration layer. Routes AI calls:
 *   - When a valid providerConfig is passed from the frontend → uses its settings
 *   - When providerConfig is for OpenRouter with no apiKey → injects env key automatically
 *   - When no config is passed → uses OpenRouter env config as default
 *
 * All business logic and error handling live in OpenRouterProvider.
 */

import { openRouterProvider, OpenRouterError } from './OpenRouterProvider.js';

interface ProviderConfig {
  provider: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

/**
 * Call AI with a system prompt + user message.
 * Returns the raw text/JSON string from the model.
 *
 * @param providerConfig  Optional config from frontend. If null/undefined → uses env OpenRouter.
 * @param systemPrompt    System prompt string.
 * @param userMessage     User message string.
 */
export async function callAIService(
  providerConfig: ProviderConfig | null | undefined,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const cfg = providerConfig;

  // ── OpenRouter path (env-backed) ─────────────────────────────────────────
  // Handles: no config, openrouter provider, or missing apiKey on openrouter selection
  const isOpenRouterSelected = !cfg || cfg.provider === 'openrouter';
  if (isOpenRouterSelected) {
    const apiKey = cfg?.apiKey || undefined; // OpenRouterProvider will fall back to env
    return openRouterProvider.callJSON(systemPrompt, userMessage, apiKey, cfg?.model);
  }

  // ── All other providers: pass through as-is (existing server.ts handles them) ──
  // This function is only invoked for OpenRouter. Other providers use the
  // existing callAI() in server.ts directly.
  throw new Error(
    `AIService.callAIService: unexpected provider "${cfg.provider}" — ` +
      'use the server-level callAI() for non-OpenRouter providers.'
  );
}

/** Re-export error type for use in server.ts */
export { OpenRouterError };
