import { createReadStream } from 'node:fs';
import { createHash, createPrivateKey, createSign } from 'node:crypto';

export async function sha256File(pathToFile: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(pathToFile)) {
    hash.update(chunk as Buffer);
  }

  return hash.digest('hex');
}

/** RSA-SHA256 signature over the raw 32-byte sha256 artifact digest. */
export function signArtifactSha256Hex(shaHex: string, pem: string): string {
  createPrivateKey(pem);

  const signer = createSign('RSA-SHA256');
  signer.update(Buffer.from(shaHex, 'hex'));
  signer.end();

  return signer.sign(pem, 'base64');
}
