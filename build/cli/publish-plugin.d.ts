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
export declare function publishPlugin(opts: PublishPluginOptions): Promise<{
    artifactUri: string;
    sha256: string;
}>;
//# sourceMappingURL=publish-plugin.d.ts.map