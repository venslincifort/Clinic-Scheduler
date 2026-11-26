import type { Session } from "../session";

declare global {
  namespace Express {
    interface Request {
      auth?: Session;
    }
  }
}

export {};