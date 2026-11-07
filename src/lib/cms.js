// HMV CMS public API contract (docs/cms-integration.md), shared by the transports and the response mappers.
// A transport is `get(path, params) → Promise<body>` that rejects with `{ status }` (the HTTP status, 0 when the body
// is malformed): the browser one in the Vite app (src/app/cms.js), a server one in Next.js (CMS PR). Mappers
// (features/*/api.js) take the transport as an argument, so they never touch fetch, caching or the environment.
// Plain .js with no aliases or import.meta so `node --test` can load it.

export const cmsUrl = (path, params) => `/api/v1/public${path}?${new URLSearchParams(params)}`;

export const cmsError = (status, message) => Object.assign(new Error(message), { status });

export const malformed = () => cmsError(0, 'Malformed CMS response');
