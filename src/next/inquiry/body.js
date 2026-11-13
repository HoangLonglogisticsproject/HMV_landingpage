// Reading a request body with a byte limit, so an oversized request is refused without being buffered: a declared
// Content-Length over the limit is refused before reading, and a chunked (or understated) body is read only until it
// passes the limit, then the stream is cancelled.

/**
 * The body as UTF-8 text, or null when it is larger than `maxBytes`.
 * @param {Request} request
 * @param {number} maxBytes
 */
export async function readBodyLimited(request, maxBytes) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  // Decoded once at the end, so a multi-byte character split across chunks stays whole.
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}
