import type {
    PluginDefinition,
    PluginManifest,
    FilterDefinition,
    EndpointHandler,
    FilterRegistration,
    EndpointDefinition,
} from './types.js';

export interface ResolvedPlugin extends PluginDefinition {
    __escalated: true;
    _normalizedFilters?: Record<string, FilterDefinition>;
    _normalizedEndpoints?: Record<string, EndpointHandler>;
    toManifest(): PluginManifest;
}

export function definePlugin(definition: PluginDefinition): ResolvedPlugin {
    // Normalize filters: shorthand function → { priority: 10, handler }
    const normalizedFilters: Record<string, FilterDefinition> = {};
    if (definition.filters) {
        for (const [hook, registration] of Object.entries(definition.filters)) {
            if (typeof registration === 'function') {
                normalizedFilters[hook] = { priority: 10, handler: registration };
            } else {
                normalizedFilters[hook] = {
                    priority: (registration as FilterDefinition).priority ?? 10,
                    handler: (registration as FilterDefinition).handler,
                };
            }
        }
    }

    // Normalize endpoints: shorthand function → { handler }
    const normalizedEndpoints: Record<string, EndpointHandler> = {};
    if (definition.endpoints) {
        for (const [key, ep] of Object.entries(definition.endpoints)) {
            if (typeof ep === 'function') {
                normalizedEndpoints[key] = { handler: ep };
            } else {
                normalizedEndpoints[key] = ep as EndpointHandler;
            }
        }
    }

    function toManifest(): PluginManifest {
        const endpoints = Object.entries(normalizedEndpoints).map(([key, ep]) => {
            const [method, path] = key.split(' ', 2);
            return { method: method!, path: path!, capability: ep.capability };
        });

        const webhooks = Object.keys(definition.webhooks ?? {}).map((key) => {
            const [method, path] = key.split(' ', 2);
            return { method: method!, path: path! };
        });

        const filterHooks = Object.entries(normalizedFilters).map(([hook, def]) => ({
            hook,
            priority: def.priority ?? 10,
        }));

        const widgets = (definition.widgets ?? []).map(({ badge, ...rest }) => ({
            ...rest,
            hasBadge: typeof badge === 'function',
        }));

        return {
            name: definition.name,
            version: definition.version,
            description: definition.description,
            config: definition.config ?? [],
            pages: definition.pages ?? [],
            components: definition.components ?? [],
            widgets,
            actionHooks: Object.keys(definition.actions ?? {}),
            filterHooks,
            endpoints,
            webhooks,
            cronSchedules: Object.keys(definition.cron ?? {}),
        };
    }

    return {
        ...definition,
        __escalated: true,
        _normalizedFilters: normalizedFilters,
        _normalizedEndpoints: normalizedEndpoints,
        toManifest,
    };
}
