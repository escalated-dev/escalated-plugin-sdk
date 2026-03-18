import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { definePlugin } from '../src/define-plugin.js';

describe('definePlugin', () => {
    it('returns the plugin definition with metadata', () => {
        const plugin = definePlugin({
            name: 'test-plugin',
            version: '1.0.0',
            description: 'A test plugin',
            actions: {
                'ticket.created': async () => {},
            },
        });

        assert.strictEqual(plugin.name, 'test-plugin');
        assert.strictEqual(plugin.version, '1.0.0');
        assert.ok(plugin.__escalated);
    });

    it('normalizes filter shorthand to priority + handler', () => {
        const handler = (val: unknown) => val;
        const plugin = definePlugin({
            name: 'test',
            version: '1.0.0',
            filters: {
                'notification.channels': handler,
            },
        });

        const normalized = plugin._normalizedFilters!['notification.channels'];
        assert.strictEqual(normalized.priority, 10);
        assert.strictEqual(normalized.handler, handler);
    });

    it('preserves explicit filter priority', () => {
        const handler = (val: unknown) => val;
        const plugin = definePlugin({
            name: 'test',
            version: '1.0.0',
            filters: {
                'ticket.actions': { priority: 5, handler },
            },
        });

        const normalized = plugin._normalizedFilters!['ticket.actions'];
        assert.strictEqual(normalized.priority, 5);
    });

    it('normalizes endpoint shorthand to capability + handler', () => {
        const handler = async () => ({});
        const plugin = definePlugin({
            name: 'test',
            version: '1.0.0',
            endpoints: {
                'GET /settings': handler,
            },
        });

        const normalized = plugin._normalizedEndpoints!['GET /settings'];
        assert.strictEqual(normalized.capability, undefined);
        assert.strictEqual(normalized.handler, handler);
    });

    it('builds a manifest', () => {
        const plugin = definePlugin({
            name: 'slack',
            version: '0.1.0',
            config: [{ name: 'token', label: 'Token', type: 'password' }],
            actions: { 'ticket.created': async () => {} },
            filters: { 'notification.channels': (v: unknown) => v },
            pages: [{ route: 'settings', component: 'SlackSettings', layout: 'admin' }],
            components: [{ page: 'ticket.show', slot: 'sidebar', component: 'SlackPanel' }],
            endpoints: { 'GET /settings': async () => ({}) },
            webhooks: { 'POST /events': async () => ({}) },
            cron: { 'every:1h': async () => {} },
        });

        const manifest = plugin.toManifest();
        assert.strictEqual(manifest.name, 'slack');
        assert.deepStrictEqual(manifest.actionHooks, ['ticket.created']);
        assert.strictEqual(manifest.filterHooks[0].hook, 'notification.channels');
        assert.strictEqual(manifest.filterHooks[0].priority, 10);
        assert.strictEqual(manifest.endpoints[0].method, 'GET');
        assert.strictEqual(manifest.endpoints[0].path, '/settings');
        assert.strictEqual(manifest.webhooks[0].method, 'POST');
        assert.deepStrictEqual(manifest.cronSchedules, ['every:1h']);
    });
});
