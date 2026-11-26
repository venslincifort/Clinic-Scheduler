import type { NextFunction, Request, Response } from "express";
import { COOKIE_NAME, getSession } from "../session";

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const session = await getSession(req.cookies?.[COOKIE_NAME]);
  if (!session) return res.status(401).json({ error: "session_expired" });

  req.auth = session;
  next();
}