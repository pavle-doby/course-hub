import { ZodType } from "zod";
import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "@repo/contract";

/**
 * Validate a raw (unparsed) JSON body against a Zod schema.
 *
 * Like `validate()`, this writes the parsed data to `res.locals.body`. Unlike
 * `validate()`, it works on the raw request body (a Buffer) left by the
 * `express.raw()` parser, which is required for webhook signature verification.
 */
export function validateRawBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!Buffer.isBuffer(req.body)) {
      const error = new BadRequestError();
      res.status(error.status).json(error);
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch {
      const error = new BadRequestError();
      res.status(error.status).json(error);
      return;
    }

    const result = schema.safeParse(payload);
    if (!result.success) {
      const error = new BadRequestError({ error: result.error });
      res.status(error.status).json(error);
      return;
    }

    res.locals.body = result.data;
    next();
  };
}
