import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { httpResponse } from '../src/index.js';

describe('plugin HTTP response contract', () => {
  it('round trips an explicit rejection through JSON-RPC', () => {
    assert.deepEqual(JSON.parse(JSON.stringify(httpResponse(401, { error: 'Invalid signature' }, {
      headers: { 'Cache-Control': 'no-store' },
    }))), {
      __escalated_http: 1, status: 401, headers: { 'cache-control': 'no-store' },
      format: 'json', body: { error: 'Invalid signature' },
    });
  });

  it('supports exact text responses and empty success responses', () => {
    assert.equal(httpResponse(200, 'challenge\n', { format: 'text' }).body, 'challenge\n');
    assert.equal(httpResponse(204).body, null);
    assert.throws(() => httpResponse(200, {}, { format: 'text' }), TypeError);
  });

  it('rejects invalid status, header injection, duplicate headers and transport headers', () => {
    for (const status of [199, 600, 200.5, NaN]) assert.throws(() => httpResponse(status), TypeError);
    for (const headers of [
      { 'bad header': 'x' }, { 'x-test': 'ok\r\nSet-Cookie: injected' },
      { 'Content-Length': '2' }, { 'Set-Cookie': 'session=1' },
      { 'X-Test': 'first', 'x-test': 'second' },
    ]) assert.throws(() => httpResponse(200, {}, { headers }), TypeError);
  });
});
