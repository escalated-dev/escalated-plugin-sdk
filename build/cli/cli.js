#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { publishPlugin } from './publish-plugin.js';
function printUsage() {
    console.error(`Usage:
  esc-plugin publish <bundle.tgz> [--manifest manifest.json] [--publisher slug] [--cloud URL] [--token PAT]
    [--private-key pem-path] [--artifact-uri https://...] [--artifact-public-base https://...]
    [--s3-bucket B] [--s3-region R] [--s3-endpoint URL] [--s3-prefix path/]
Env: ESCALATED_PUBLISHER_SLUG, ESCALATED_CLOUD_URL, ESCALATED_API_TOKEN, ESCALATED_ARTIFACT_PUBLIC_BASE, ESCALATED_S3_*`);
}
function readPair(argv, index) {
    const next = argv[index + 1];
    if (!next) {
        throw new Error(`Missing value for ${argv[index]}`);
    }
    return [next, index + 2];
}
async function main() {
    const argv = process.argv.slice(2);
    if (argv.length === 0 || argv[0] !== 'publish') {
        printUsage();
        process.exitCode = 1;
        return;
    }
    let manifestPath = 'manifest.json';
    let publisherSlug;
    let cloudBaseUrl;
    let bearerToken;
    let artifactUri;
    let artifactPublicBase;
    let s3Bucket;
    let s3Region;
    let s3Endpoint;
    let s3Prefix;
    let privateKeyPath;
    const positional = [];
    for (let i = 1; i < argv.length;) {
        const token = argv[i];
        if (!token.startsWith('--')) {
            positional.push(token);
            i += 1;
            continue;
        }
        switch (token) {
            case '--manifest': {
                const [v, next] = readPair(argv, i);
                manifestPath = v;
                i = next;
                break;
            }
            case '--publisher': {
                const [v, next] = readPair(argv, i);
                publisherSlug = v;
                i = next;
                break;
            }
            case '--cloud': {
                const [v, next] = readPair(argv, i);
                cloudBaseUrl = v;
                i = next;
                break;
            }
            case '--token': {
                const [v, next] = readPair(argv, i);
                bearerToken = v;
                i = next;
                break;
            }
            case '--artifact-uri': {
                const [v, next] = readPair(argv, i);
                artifactUri = v;
                i = next;
                break;
            }
            case '--artifact-public-base': {
                const [v, next] = readPair(argv, i);
                artifactPublicBase = v;
                i = next;
                break;
            }
            case '--s3-bucket': {
                const [v, next] = readPair(argv, i);
                s3Bucket = v;
                i = next;
                break;
            }
            case '--s3-region': {
                const [v, next] = readPair(argv, i);
                s3Region = v;
                i = next;
                break;
            }
            case '--s3-endpoint': {
                const [v, next] = readPair(argv, i);
                s3Endpoint = v;
                i = next;
                break;
            }
            case '--s3-prefix': {
                const [v, next] = readPair(argv, i);
                s3Prefix = v;
                i = next;
                break;
            }
            case '--private-key': {
                const [v, next] = readPair(argv, i);
                privateKeyPath = v;
                i = next;
                break;
            }
            default:
                throw new Error(`Unknown flag ${token}`);
        }
    }
    if (positional.length !== 1) {
        throw new Error('Provide exactly one tarball path argument.');
    }
    const tarballPath = positional[0];
    publisherSlug ??= process.env.ESCALATED_PUBLISHER_SLUG;
    cloudBaseUrl ??= process.env.ESCALATED_CLOUD_URL;
    bearerToken ??= process.env.ESCALATED_API_TOKEN;
    if (!publisherSlug) {
        throw new Error('Missing publisher slug (use --publisher or ESCALATED_PUBLISHER_SLUG).');
    }
    if (!cloudBaseUrl) {
        throw new Error('Missing cloud base URL (use --cloud or ESCALATED_CLOUD_URL).');
    }
    if (!bearerToken) {
        throw new Error('Missing API token (use --token or ESCALATED_API_TOKEN).');
    }
    let privateKeyPem;
    if (privateKeyPath) {
        privateKeyPem = await readFile(privateKeyPath, 'utf8');
    }
    await publishPlugin({
        tarballPath,
        manifestPath,
        publisherSlug,
        cloudBaseUrl,
        bearerToken,
        artifactUri,
        artifactPublicBase,
        s3Bucket,
        s3Region,
        s3Endpoint,
        s3Prefix,
        privateKeyPem,
    });
    console.log('Published plugin version successfully.');
}
main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map