import argon2 from "argon2";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../db";
import { COOKIE_NAME, createSession, destroySession, getSession } from "../session";

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
// limits login attempts to 10 per 15 minutes 
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_attempts" });
  },
});

// Verified against when the email doesn't exist, so response time doesn't reveal which emails are real.
const dummyHash = argon2.hash("not-a-real-password", { type: argon2.argon2id });

authRouter.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "bad_request" });
  }

  const provider = await prisma.provider.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  const valid = await argon2.verify(provider?.passwordHash ?? (await dummyHash), password);

  if (!provider || !valid || !provider.isActive) {
    await prisma.auditLog.create({
      data: {
        actorId: provider?.id ?? null,
        action: "LOGIN_FAILURE",
        ipAddress: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
      },
    });
    return res.status(401).json({ error: "invalid_credentials" }); // same response for every failure
  }

  const sid = await createSession(provider.id, provider.role); // new ID on every login
  await prisma.provider.update({ where: { id: provider.id }, data: { lastLoginAt: new Date() } });
  await prisma.auditLog.create({
    data: {
      actorId: provider.id,
      action: "LOGIN_SUCCESS",
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    },
  });

  res.cookie(COOKIE_NAME, sid, cookieOptions); // no maxAge: it ends when the browser closes
  res.json({
    id: provider.id,
    name: `${provider.firstName} ${provider.lastName}`,
    role: provider.role,
  });
});

authRouter.get("/me", async (req, res) => {
  const session = await getSession(req.cookies[COOKIE_NAME]);
  if (!session) return res.status(401).json({ error: "unauthenticated" });

  const provider = await prisma.provider.findUnique({ where: { id: session.providerId } });
  if (!provider || !provider.isActive) {
    await destroySession(req.cookies[COOKIE_NAME]);
    return res.status(401).json({ error: "unauthenticated" });
  }

  res.json({
    id: provider.id,
    name: `${provider.firstName} ${provider.lastName}`,
    role: provider.role,
  });
});

authRouter.post("/logout", async (req, res) => {
  const sid = req.cookies[COOKIE_NAME];
  const session = await getSession(sid);
  await destroySession(sid);
  res.clearCookie(COOKIE_NAME, cookieOptions);

  if (session) {
    await prisma.auditLog.create({
      data: {
        actorId: session.providerId,
        action: "LOGOUT",
        ipAddress: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
      },
    });
  }
  res.status(204).end();
});