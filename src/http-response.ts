import type { PluginHttpResponse } from './types.js';

/** Return an explicit HTTP response from an endpoint or webhook handler. */
export function httpResponse(
  status: number,
  body: unknown = null,
  options: { headers?: Record<string, string>; format?: 'json' | 'text' } = {},
): PluginHttpResponse {
  if (!Number.isInteger(status) || status < 200 || status > 599) {
    throw new TypeError('HTTP response status must be an integer between 200 and 599.');
  }
  const format = options.format ?? 'json';
  if (format !== 'json' && format !== 'text') {
    throw new TypeError('HTTP response format must be json or text.');
  }
  if (format === 'text' && typeof body !== 'string') {
    throw new TypeError('Text responses require a string body.');
  }
  const headers: Record<string, string> = {};
  const blocked = new Set([
    'connection',
    'content-length',
    'transfer-encoding',
    'keep-alive',
    'upgrade',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'set-cookie',
  ]);
  for (const [name, value] of Object.entries(options.headers ?? {})) {
    const lower = name.toLowerCase();
    if (
      !/^[!#$%&'*+.^_`|~0-9a-z-]+$/.test(lower) ||
      blocked.has(lower) ||
      typeof value !== 'string' ||
      [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
    ) {
      throw new TypeError('Invalid plugin response header.');
    }
    if (Object.hasOwn(headers, lower)) {
      throw new TypeError('Duplicate plugin response header.');
    }
    Object.defineProperty(headers, lower, { value, enumerable: true });
  }
  return { __escalated_http: 1, status, headers, format, body };
}
