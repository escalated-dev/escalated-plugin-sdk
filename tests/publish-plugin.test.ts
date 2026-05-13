import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';

import { publishPlugin } from '../src/cli/publish-plugin.js';
import { sha256File, signArtifactSha256Hex } from '../src/cli/file-hash.js';
import { generateKeyPairSync } from 'node:crypto';

describe('publishPlugin', () => {
  it('posts a publish payload (artifact-uri mode, no S3)', async () => {
    const dir = join(tmpdir(), `esc-plugin-publish-${Date.now()}`);
    await mkdir(dir, { recursive: true });

    const tarball = join(dir, 'bundle.tgz');
    await writeFile(tarball, gzipSync(Buffer.from('hello bundle')));

    const manifestPath = join(dir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify({ slug: 'demo', version: '1.0.0', name: 'Demo' }, null, 2));

    const calls: Array<{ url: string; body: unknown }> = [];
    const fetchFn: typeof fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      calls.push({ url, body: JSON.parse(String(init?.body ?? '{}')) });
      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    };

    const result = await publishPlugin({
      tarballPath: tarball,
      manifestPath,
      publisherSlug: 'acme',
      cloudBaseUrl: 'https://cloud.test',
      bearerToken: 'token-123',
      artifactUri: 'https://cdn.test/acme/demo.tgz',
      fetchFn,
    });

    assert.equal(calls.length, 1);
    assert.ok(calls[0]!.url.endsWith('/api/v1/marketplace/publishers/acme/versions'));
    const posted = calls[0]!.body as Record<string, unknown>;
    assert.equal(posted.artifact_uri, 'https://cdn.test/acme/demo.tgz');
    assert.equal(typeof posted.artifact_sha256, 'string');
    assert.equal((posted.manifest as { slug: string }).slug, 'demo');
    assert.equal(result.sha256, posted.artifact_sha256);

    await rm(dir, { recursive: true, force: true });
  });
});

describe('file hashing / signing helpers', () => {
  it('computes deterministic sha256 of a tarball', async () => {
    const dir = join(tmpdir(), `esc-plugin-hash-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const tarball = join(dir, 'bundle.tgz');

    await writeFile(tarball, gzipSync(Buffer.from('abc')));

    const a = await sha256File(tarball);

    const b = await sha256File(tarball);

    assert.equal(a, b);
    await rm(dir, { recursive: true, force: true });
  });

  it('signs the sha digest with RSA PEM', () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    const shaHex = 'ab'.repeat(32);

    const sig = signArtifactSha256Hex(shaHex, pem);
    assert.ok(sig.length > 32);
  });
});
