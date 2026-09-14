import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@repo/contract";
import { env } from "api/env";

const MAX_WEBHOOK_AGE_SECONDS = 300;

function isValidWebhookSignature(signature: string | undefined, rawBody: Buffer): boolean {
  if (!signature) {
    return false;
  }

  const parts = Object.fromEntries(signature.split(",").map((part) => part.split("=", 2)));
  const timestamp = parts.time;
  const signatureHex = parts.sig1;

  if (!timestamp || !signatureHex || !/^\d+$/.test(timestamp)) {
    return false;
  }

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_WEBHOOK_AGE_SECONDS) {
    return false;
  }

  const expected = createHmac("sha256", env.CLOUDFLARE_STREAM_WEBHOOK_SECRET)
    .update(Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]))
    .digest();
  const received = Buffer.from(signatureHex, "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
}

/**
 * Verify the `Webhook-Signature` header against the raw request body.
 *
 * The signature is an HMAC-SHA256 over `timestamp + rawBytes`, so it must run
 * after the raw body parser and before any handler that trusts the payload.
 */
export function validateWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const rawBody = req.body as Buffer;
  const signature = req.header("Webhook-Signature") ?? undefined;

  if (!isValidWebhookSignature(signature, rawBody)) {
    const error = new UnauthorizedError();
    res.status(error.status).json(error);
    return;
  }

  next();
}
