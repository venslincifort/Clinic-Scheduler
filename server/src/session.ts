import { createHash, randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { redis } from "./redis";

export const COOKIE_NAME = "SID";
const IDLE_SECONDS = 20 * 60;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;

export interface Session {
  providerId: string;
  role: Role;
  createdAt: number;
}


const keyFor = (sid: string) => "sess:" + createHash("sha256").update(sid).digest("hex");

export async function createSession(providerId: string, role: Role): Promise<string> {
  const sid = randomBytes(32).toString("base64url");
  const session: Session = { providerId, role, createdAt: Date.now() };
  await redis.set(keyFor(sid), JSON.stringify(session), "EX", IDLE_SECONDS);
  return sid;
}

export async function getSession(sid: string | undefined): Promise<Session | null> {
  if (!sid) return null;
  const raw = await redis.get(keyFor(sid));
  if (!raw) return null;

  const session = JSON.parse(raw) as Session;
  if (Date.now() - session.createdAt > ABSOLUTE_MS) {
    await redis.del(keyFor(sid));
    return null;
  }
  await redis.expire(keyFor(sid), IDLE_SECONDS); // slide the 20-minute window
  return session;
}

export async function destroySession(sid: string | undefined): Promise<void> {
  if (sid) await redis.del(keyFor(sid));
}