/**
 * OpenRouterProvider
 *
 * Dedicated client for the OpenRouter API.
 * Credentials are loaded exclusively from environment variables — never from
 * the request body or any client-supplied value.
 *
 * Environment variables consumed:
 *   OPENROUTER_API_KEY      – Required. Your secret OpenRouter key.
 *   OPENROUTER_BASE_URL     – Optional. Defaults to https://openrouter.ai/api/v1
 *   OPENROUTER_MODEL        – Optional. Defaults to meta-llama/llama-3.1-8b-instruct:free
 *   OPENROUTER_HTTP_REFERER – Optional. Sent as HTTP-Referer header.
 *   OPENROUTER_APP_TITLE    – Optional. Sent as X-Title header.
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
  messages: OpenRouterMessage[];
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'MISSING_API_KEY'
      | 'AUTHENTICATION_FAILED'
      | 'MODEL_NOT_FOUND'
      | 'RATE_LIMITED'
      | 'INSUFFICIENT_CREDITS'
      | 'CONTEXT_LIMIT'
      | 'SERVICE_UNAVAILABLE'
      | 'MALFORMED_RESPONSE'
      | 'NETWORK_ERROR'
      | 'UNKNOWN',
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class OpenRouterProvider {
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly referer: string;
  private readonly appTitle: string;

  constructor() {
    this.baseUrl = (
      process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    ).replace(/\/$/, '');
    this.defaultModel =
      process.env.OPENROUTER_MODEL || 'openrouter/auto';
    this.referer =
      process.env.OPENROUTER_HTTP_REFERER || 'https://knowledge-graph-ai.local';
    this.appTitle = process.env.OPENROUTER_APP_TITLE || 'Knowledge Graph AI';
  }

  /** Resolved model (env > default). */
  get model(): string {
    return this.defaultModel;
  }

  /** True if OPENROUTER_API_KEY is set in env. */
  get hasEnvKey(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  /**
   * Send a chat completion request.
   * @param options  Full call options including messages array.
   * @param apiKey   Optional key override (from user's Settings UI). Falls back to env.
   */
  async chat(options: OpenRouterCallOptions, apiKey?: string): Promise<string> {
    const key = apiKey || process.env.OPENROUTER_API_KEY;

    if (!key) {
      throw new OpenRouterError(
        'OpenRouter API key is not configured. ' +
          'Set OPENROUTER_API_KEY in your .env file or enter it in Settings.',
        'MISSING_API_KEY'
      );
    }

    const model = options.model || this.defaultModel;
    const body: Record<string, unknown> = {
      model,
      messages: options.messages,
    };
    if (options.temperature !== undefined) body.temperature = options.temperature;
    if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
    if (options.responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.referer,
          'X-Title': this.appTitle,
        },
        body: JSON.stringify(body),
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new OpenRouterError(
        `Network error contacting OpenRouter: ${msg}`,
        'NETWORK_ERROR'
      );
    }

    if (!resp.ok) {
      await this._handleError(resp);
    }

    let data: unknown;
    try {
      data = await resp.json();
    } catch {
      throw new OpenRouterError(
        'OpenRouter returned a non-JSON response.',
        'MALFORMED_RESPONSE',
        resp.status
      );
    }

    const choice = (data as { choices?: { message?: { content?: string | null }; finish_reason?: string }[] })
      ?.choices?.[0];
    const content = choice?.message?.content;

    // Some free models return null/empty content (e.g. when rate-limited mid-stream
    // or when the model refuses to respond). Provide a clear actionable error.
    if (content === null || content === undefined) {
      const finishReason = choice?.finish_reason ?? 'unknown';
      throw new OpenRouterError(
        `OpenRouter model returned an empty response (finish_reason: ${finishReason}). ` +
          'This often happens with free-tier rate limits or model refusals. ' +
          'Try again in a moment or switch to a different free model in Settings.',
        'MALFORMED_RESPONSE',
        resp.status
      );
    }

    if (typeof content !== 'string') {
      throw new OpenRouterError(
        'OpenRouter response did not contain a message content field.',
        'MALFORMED_RESPONSE',
        resp.status
      );
    }

    const trimmed = content.trim();
    if (trimmed === '') {
      throw new OpenRouterError(
        'OpenRouter model returned an empty string. ' +
          'Try again or switch to a different free model in Settings.',
        'MALFORMED_RESPONSE',
        resp.status
      );
    }

    return trimmed;
  }

  /**
   * Convenience: send a simple system + user message pair and expect a JSON string back.
   */
  async callJSON(
    systemPrompt: string,
    userMessage: string,
    apiKey?: string,
    model?: string
  ): Promise<string> {
    return this.chat(
      {
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        maxTokens: 4096,
        responseFormat: 'json_object',
      },
      apiKey
    );
  }

  /**
   * Fetch the live OpenRouter model catalog.
   * Returns raw model list from the API.
   */
  async listModels(apiKey?: string): Promise<unknown[]> {
    const key = apiKey || process.env.OPENROUTER_API_KEY;

    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/models`, {
        headers: key ? { Authorization: `Bearer ${key}` } : {},
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new OpenRouterError(
        `Network error fetching OpenRouter models: ${msg}`,
        'NETWORK_ERROR'
      );
    }

    if (!resp.ok) {
      await this._handleError(resp);
    }

    const data = (await resp.json()) as { data?: unknown[] };
    return data.data ?? [];
  }

  /** Map HTTP error codes to typed OpenRouterError. */
  private async _handleError(resp: Response): Promise<never> {
    let bodyText = '';
    try {
      bodyText = await resp.text();
    } catch {
      /* ignore */
    }

    // Try to extract a useful message without leaking auth tokens
    let humanMessage = bodyText;
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed?.error?.message) humanMessage = parsed.error.message;
      else if (parsed?.message) humanMessage = parsed.message;
    } catch {
      /* ignore */
    }

    switch (resp.status) {
      case 401:
      case 403:
        throw new OpenRouterError(
          `OpenRouter authentication failed (${resp.status}). Check your API key.`,
          'AUTHENTICATION_FAILED',
          resp.status
        );
      case 404:
        throw new OpenRouterError(
          `The requested OpenRouter model was not found (404). Check OPENROUTER_MODEL in your .env.`,
          'MODEL_NOT_FOUND',
          404
        );
      case 429:
        throw new OpenRouterError(
          `OpenRouter rate limit reached (429). ` +
            `Free models have strict limits; consider upgrading or switching models.`,
          'RATE_LIMITED',
          429
        );
      case 402:
        throw new OpenRouterError(
          `OpenRouter insufficient credits (402). ` +
            `Add credits at openrouter.ai/credits or switch to a free model.`,
          'INSUFFICIENT_CREDITS',
          402
        );
      case 400:
        if (humanMessage.toLowerCase().includes('context')) {
          throw new OpenRouterError(
            `Context window exceeded (400): ${humanMessage}`,
            'CONTEXT_LIMIT',
            400
          );
        }
        throw new OpenRouterError(
          `OpenRouter bad request (400): ${humanMessage}`,
          'UNKNOWN',
          400
        );
      case 503:
      case 502:
        throw new OpenRouterError(
          `OpenRouter service unavailable (${resp.status}). Try again in a moment.`,
          'SERVICE_UNAVAILABLE',
          resp.status
        );
      default:
        throw new OpenRouterError(
          `OpenRouter API error (${resp.status}): ${humanMessage}`,
          'UNKNOWN',
          resp.status
        );
    }
  }
}

/** Singleton instance — import this in server.ts */
export const openRouterProvider = new OpenRouterProvider();
