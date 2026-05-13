export declare function sha256File(pathToFile: string): Promise<string>;
/** RSA-SHA256 signature over the raw 32-byte sha256 artifact digest. */
export declare function signArtifactSha256Hex(shaHex: string, pem: string): string;
//# sourceMappingURL=file-hash.d.ts.map