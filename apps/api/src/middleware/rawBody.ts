import express, { type RequestHandler } from "express";

/**
 * Parse the request body as a raw Buffer instead of JSON.
 *
 * Cloudflare Stream webhooks sign the exact request payload, so the signature
 * can only be verified against the raw bytes — not a re-serialized JSON object.
 * This middleware must be mounted for the webhook path BEFORE `express.json()`.
 */
export const handleRawBody: RequestHandler = express.raw({ type: "application/json" });
