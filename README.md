<p align="center">
  <a href="https://escalated.dev"><img src="https://raw.githubusercontent.com/escalated-dev/escalated/main/docs/assets/readme/logo.png" width="72" height="72" alt="Escalated"></a>
</p>

<h1 align="center">Escalated Plugin SDK</h1>

<p align="center">
  Write Escalated plugins once in TypeScript.<br>
  The same plugin runs on every Escalated backend through the plugin runtime.
</p>

<p align="center">
  <a href="https://escalated.dev"><b>Website</b></a> ·
  <a href="https://escalated.dev/docs"><b>Docs</b></a> ·
  <a href="https://escalated.dev/cloud"><b>Cloud</b></a> ·
  <a href="https://github.com/escalated-dev/escalated-plugin-sdk/releases"><b>Releases</b></a>
</p>

<br>

```ts
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

## What it does

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Hook into the helpdesk</h3>
      React to ticket events, change values as they pass through filters, and add your own endpoints, webhooks and scheduled tasks.
    </td>
    <td width="50%" valign="top">
      <h3>Extend the UI without forking it</h3>
      Add admin pages with menu items, put panels into existing pages, and show dashboard widgets with live badges.
    </td>
  </tr>
</table>

## Features

<table>
<tr>
<td width="33%" valign="top">

**Hooks**
- Action hooks, fire-and-forget
- Filter hooks with priorities
- Emit custom hooks for other plugins

</td>
<td width="33%" valign="top">

**HTTP**
- REST endpoints with capability checks
- Incoming webhooks
- Raw request bytes for signature checks
- Real HTTP statuses with `httpResponse`

</td>
<td width="33%" valign="top">

**Schedule and lifecycle**
- Cron tasks keyed by expression
- Activate and deactivate hooks
- Settings fields in the admin UI

</td>
</tr>
<tr>
<td width="33%" valign="top">

**Helpdesk data**
- Tickets, replies and contacts
- Tags, departments and agents
- The current user

</td>
<td width="33%" valign="top">

**Plugin services**
- Plugin-scoped key-value and query store
- Config values, outbound HTTP, logging
- Broadcast to channels, users or tickets

</td>
<td width="33%" valign="top">

**UI and real-time**
- Full-page routes with menu items
- Components injected into page slots
- Dashboard widgets with badges
- React to broadcast ticket events

</td>
</tr>
</table>

<p align="center"><sub><a href="docs/core-api.md">Every feature in detail</a></sub></p>

<p align="center">
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript_5.4+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.4+"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  <a href="https://www.jsonrpc.org/specification"><img src="https://img.shields.io/badge/JSON--RPC_2.0-555555?style=for-the-badge" alt="JSON-RPC 2.0"></a>
</p>

## Quick start

```bash
npm install @escalated-dev/plugin-sdk
```

Define your plugin with `definePlugin` as above. The [getting started guide](docs/getting-started.md) lists the requirements.

## Learn more

- [Getting started](docs/getting-started.md) · [Core API, plugin context, UI extensions and events](docs/core-api.md)
- [Plugin HTTP contract](docs/http-contract.md)
- [Plugin runtime](https://github.com/escalated-dev/escalated-plugin-runtime), which loads and runs your plugins
- [Escalated docs](https://escalated.dev/docs) · [Docs source](https://github.com/escalated-dev/escalated-docs) · [Shared frontend](https://github.com/escalated-dev/escalated)

## License

MIT. Copyright (c) Escalated.dev. See [LICENSE](LICENSE).
