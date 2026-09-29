# Plugin HTTP contract, version 1

Hosts send `httpContract: 1`, `rawBodyBase64` (canonical base64 of the original
request bytes), lower-case scalar `headers`, separate route `params` and `query`,
and `clientIp` resolved through their trusted proxy configuration. The runtime
decodes the bytes to `req.rawBody: Uint8Array` without parsing or re-encoding them.
`req.body` remains parsed convenience data. Request fields are optional for older
hosts; signature handlers must reject requests without the required raw bytes.
Never use `JSON.stringify(req.body)` to verify a signed request.

Return `httpResponse(401, { error: 'Invalid signature' })` to select a real HTTP
status. The serialized envelope has `__escalated_http: 1`, `status`, `headers`,
`format` (`json` by default, or `text`) and `body`. Ordinary returned objects,
including `{ status: 401 }`, remain ordinary JSON data with the legacy default
status. Text responses require a string body. Transport headers and Set-Cookie
are not accepted; hosts validate the envelope independently before rendering it.

Version 1 is an additive contract within JSON-RPC protocol 1.0. A runtime that
supports it advertises `http_contract_versions: [1]` in its handshake. The host,
runtime and SDK must all support the contract before a plugin relies on it.
This transport work does not itself provide authentication, signature checking,
tenant routing, CORS, or a durable inbound-message processor. Privileged plugin
endpoints still require host authentication and capability checks.
