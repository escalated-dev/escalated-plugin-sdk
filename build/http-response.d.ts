import type { PluginHttpResponse } from './types.js';
/** Return an explicit HTTP response from an endpoint or webhook handler. */
export declare function httpResponse(status: number, body?: unknown, options?: {
    headers?: Record<string, string>;
    format?: 'json' | 'text';
}): PluginHttpResponse;
//# sourceMappingURL=http-response.d.ts.map