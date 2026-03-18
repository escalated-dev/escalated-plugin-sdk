import type { PluginDefinition, PluginManifest, FilterDefinition, EndpointHandler } from './types.js';
export interface ResolvedPlugin extends PluginDefinition {
    __escalated: true;
    _normalizedFilters?: Record<string, FilterDefinition>;
    _normalizedEndpoints?: Record<string, EndpointHandler>;
    toManifest(): PluginManifest;
}
export declare function definePlugin(definition: PluginDefinition): ResolvedPlugin;
//# sourceMappingURL=define-plugin.d.ts.map