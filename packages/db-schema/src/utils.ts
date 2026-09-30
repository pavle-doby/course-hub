// Global Web Crypto instead of node:crypto, so the schema also bundles for the native app
// (via @repo/contract). Only called server-side, on insert.
export const randomHex = (bytes: number): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
