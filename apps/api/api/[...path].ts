import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  try {
    const { default: app } = await import("../src/server");
    app(req, res);
  } catch (error) {
    console.error("API function initialization failed", error);
    res.status(500).json({ code: "server_error" });
  }
}
