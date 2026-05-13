import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { sha256File, signArtifactSha256Hex } from './file-hash.js';
import type { ManifestForPublish } from './types.js';

function normalizeCloudApiRoot(raw: string): string {
  let base = raw.trim().replace(/\/+$/, '');

  if (!/\/api$/i.test(base)) {
    base = `${base}/api`;
  }

  return base;
}

async function validateManifestShape(manifestJson: unknown): Promise<ManifestForPublish> {
  if (!manifestJson || typeof manifestJson !== 'object') {
    throw new TypeError('manifest.json root must be an object.');
  }

  const m = manifestJson as Record<string, unknown>;

  if (typeof m.slug !== 'string' || typeof m.version !== 'string') {
    throw new TypeError('manifest.json requires string "slug" and "version".');
  }

  const slugLower = m.slug.toLowerCase();

  if (!/^[a-z][a-z0-9_-]*$/.test(slugLower)) {
    throw new TypeError(`Invalid manifest slug "${m.slug}".`);
  }

  return {
    ...(manifestJson as ManifestForPublish),

    slug: slugLower,

    version: m.version,
  };
}

async function resolveArtifactUri(
  opts: PublishPluginOptions,

  manifest: ManifestForPublish,

  tarballAbsolute: string,
): Promise<string> {
  if (opts.artifactUri) {
    const uri = opts.artifactUri.trim();

    if (!uri.startsWith('https://')) {
      throw new TypeError('--artifact-uri must start with https://.');
    }

    return uri;
  }

  const publicBase = (opts.artifactPublicBase ?? process.env.ESCALATED_ARTIFACT_PUBLIC_BASE ?? '').trim();

  const bucket = opts.s3Bucket ?? process.env.ESCALATED_S3_BUCKET ?? process.env.AWS_S3_BUCKET;

  const region =
    opts.s3Region ?? process.env.ESCALATED_S3_REGION ?? process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;

  const endpoint = opts.s3Endpoint ?? process.env.ESCALATED_S3_ENDPOINT ?? process.env.AWS_ENDPOINT_URL ?? undefined;

  if (!bucket || !region) {
    throw new TypeError(
      'S3 uploads require ESCALATED_S3_BUCKET (or AWS_S3_BUCKET) and ESCALATED_S3_REGION (or AWS_REGION), or provide --artifact-uri.',
    );
  }

  if (!publicBase.startsWith('https://')) {
    throw new TypeError(
      'After uploading you must expose an https:// URL. Set ESCALATED_ARTIFACT_PUBLIC_BASE or pass --artifact-public-base.',
    );
  }

  let prefix =
    opts.s3Prefix ?? process.env.ESCALATED_S3_PREFIX ?? `marketplace-plugins/${opts.publisherSlug}/${manifest.slug}/`;

  prefix = prefix.replace(/\\/g, '/');

  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;

  const safeName =
    basename(tarballAbsolute).replace(/[^a-z0-9._-]+/gi, '-') || `${manifest.slug}-${manifest.version}.tar.gz`;

  const objectKey = `${normalizedPrefix}${manifest.slug}-${manifest.version}-${safeName}`;

  const client = new S3Client({
    region,

    ...(endpoint ? { endpoint, forcePathStyle: true as const } : {}),
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,

      Key: objectKey,

      Body: createReadStream(tarballAbsolute),

      ContentType: 'application/gzip',
    }),
  );

  const base = publicBase.replace(/\/+$/, '');

  return `${base}/${objectKey}`;
}

export interface PublishPluginOptions {
  tarballPath: string;

  manifestPath: string;

  publisherSlug: string;

  cloudBaseUrl: string;

  bearerToken: string;

  artifactUri?: string;

  privateKeyPem?: string;

  s3Bucket?: string;

  s3Region?: string;

  s3Endpoint?: string;

  s3Prefix?: string;

  artifactPublicBase?: string;

  fetchFn?: typeof fetch;
}

export async function publishPlugin(opts: PublishPluginOptions): Promise<{ artifactUri: string; sha256: string }> {
  const fetchFn = opts.fetchFn ?? globalThis.fetch.bind(globalThis);

  const manifestRaw = JSON.parse(await readFile(resolve(opts.manifestPath), 'utf8')) as unknown;

  const manifest = await validateManifestShape(manifestRaw);

  const tarballResolved = resolve(opts.tarballPath);

  const shaHex = await sha256File(tarballResolved);

  const artifactUri = await resolveArtifactUri(opts, manifest, tarballResolved);

  let rsaSignature: string | undefined;

  if (opts.privateKeyPem) {
    rsaSignature = signArtifactSha256Hex(shaHex, opts.privateKeyPem);
  }

  const apiRoot = normalizeCloudApiRoot(opts.cloudBaseUrl);

  const url = `${apiRoot}/v1/marketplace/publishers/${encodeURIComponent(opts.publisherSlug)}/versions`;

  const body: Record<string, unknown> = {
    manifest,

    artifact_sha256: shaHex,

    artifact_uri: artifactUri,
  };

  if (rsaSignature) {
    body.rsa_signature_base64 = rsaSignature;
  }

  const res = await fetchFn(url, {
    method: 'POST',

    headers: {
      Accept: 'application/json',

      'Content-Type': 'application/json',

      Authorization: `Bearer ${opts.bearerToken}`,
    },

    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Publish failed (${res.status} ${res.statusText}): ${text}`);
  }

  return { artifactUri, sha256: shaHex };
}
