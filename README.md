# @escalated-dev/plugin-sdk

[![Tests](https://github.com/escalated-dev/escalated-plugin-sdk/actions/workflows/run-tests.yml/badge.svg)](https://github.com/escalated-dev/escalated-plugin-sdk/actions/workflows/run-tests.yml)
[![Node.js](https://img.shields.io/badge/node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SDK for building [Escalated](https://escalated.dev) plugins. Write plugins once in TypeScript, run them across all Escalated backend frameworks (Laravel, Django, AdonisJS, Rails).

## Quick Start

```typescript
import { definePlugin } from '@escalated-dev/plugin-sdk'

export default definePlugin({
  name: 'my-plugin',
  version: '1.0.0',

  actions: {
    'ticket.created': async (event, ctx) => {
      ctx.log.info('New ticket!', event)
    },
  },
})
```

## Installation

```bash
npm install @escalated-dev/plugin-sdk
```

## Core API

### `definePlugin(definition)`

The single entry point for defining a plugin. Returns a `ResolvedPlugin` with normalized filters and endpoints and a `toManifest()` method used by the Escalated host to register your plugin.

```typescript
import { definePlugin, type PluginContext } from '@escalated-dev/plugin-sdk'

export default definePlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Does something useful',

  // Config fields shown in the admin settings UI
  config: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'notify_channel', label: 'Notify Channel', type: 'text' },
  ],

  // Action hooks — fire-and-forget
  actions: {
    'ticket.created': async (event, ctx) => { /* ... */ },
    'ticket.resolved': async (event, ctx) => { /* ... */ },
  },

  // Filter hooks — must return the (possibly modified) value
  filters: {
    'ticket.reply.compose': async (data, ctx) => {
      return { ...data, extra_field: 'value' }
    },
    // Shorthand with explicit priority
    'ticket.statuses': {
      priority: 5,
      handler: async (statuses, ctx) => [...statuses, { key: 'custom', name: 'Custom' }],
    },
  },

  // REST endpoints exposed by the plugin
  endpoints: {
    'GET /my-plugin/status': async (ctx, req) => ({ ok: true }),
    'POST /my-plugin/action': {
      capability: 'manage_settings',
      handler: async (ctx, req) => { /* ... */ },
    },
  },

  // Incoming webhooks
  webhooks: {
    'POST /webhooks/my-service': async (ctx, req) => { /* ... */ },
  },

  // Scheduled tasks (cron expression as key)
  cron: {
    '0 9 * * 1': async (ctx) => {
      ctx.log.info('Running weekly report')
    },
  },

  // Lifecycle
  onActivate: async (ctx) => { await ctx.store.set('data', 'init', { activated: true }) },
  onDeactivate: async (ctx) => { /* cleanup */ },
})
```

## Plugin Context (`ctx`)

Every handler receives a `PluginContext` with the following services:

| Property | Type | Description |
|---|---|---|
| `ctx.config` | `ConfigStore` | Read/write plugin configuration values |
| `ctx.store` | `DataStore` | Persistent key-value and query store scoped to the plugin |
| `ctx.http` | `HttpClient` | Make outbound HTTP requests |
| `ctx.broadcast` | `BroadcastClient` | Push real-time events to channels, users, or tickets |
| `ctx.log` | `Logger` | Structured logging (info, warn, error, debug) |
| `ctx.tickets` | `TicketRepository` | Find, query, create, and update tickets |
| `ctx.replies` | `ReplyRepository` | Find, query, and create replies |
| `ctx.contacts` | `ContactRepository` | Find contacts by ID or email, create contacts |
| `ctx.tags` | `TagRepository` | List and create tags |
| `ctx.departments` | `DepartmentRepository` | List and find departments |
| `ctx.agents` | `AgentRepository` | List and find agents |
| `ctx.emit` | `function` | Emit a custom hook for other plugins to listen to |
| `ctx.currentUser` | `function` | Returns the currently authenticated user, or null |

## UI Extensions

```typescript
definePlugin({
  // ...

  // Full-page routes
  pages: [
    {
      route: '/admin/my-plugin',
      component: 'MySettingsPage',
      layout: 'admin',
      capability: 'manage_settings',
      menu: { label: 'My Plugin', section: 'admin', position: 50 },
    },
  ],

  // Inject components into existing pages
  components: [
    {
      page: 'ticket.show',
      slot: 'sidebar',
      component: 'MyTicketPanel',
      order: 20,
    },
  ],

  // Dashboard widgets
  widgets: [
    {
      component: 'MyWidget',
      label: 'My Stats',
      size: 'half',
      badge: async (ctx) => {
        const count = await ctx.store.query('alerts', { unread: true })
        return count.length || null
      },
    },
  ],
})
```

## Documentation

See the [Escalated Docs](https://github.com/escalated-dev/escalated-docs) for the full plugin development guide.

## Related Packages

- **[Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime)** — Runtime host that loads and executes plugins
- **[Escalated](https://github.com/escalated-dev/escalated)** — Shared frontend (Vue 3 + Inertia.js)
- **[Escalated Docs](https://github.com/escalated-dev/escalated-docs)** — Full documentation

## Requirements

- Node.js >= 18
- TypeScript >= 5.4

## License

MIT
