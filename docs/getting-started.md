# Getting started

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

## Requirements

- Node.js >= 18
- TypeScript >= 5.4
