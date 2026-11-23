import { MOCK_AUTH, MOCK_CREDENTIALS } from "../config";

export type Role = "PROVIDER" | "STAFF";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Same message for every failed login so the UI never reveals which accounts exist.
function loginMessage(status: number): string {
  if (status === 401) return "Email or password is incorrect.";
  if (status === 429) return "Too many sign-in attempts. Wait a few minutes and try again.";
  if (status >= 500) return "Something went wrong on our end. Try again in a moment.";
  return "Couldn't sign you in. Try again.";
}

// The session lives in an httpOnly cookie set by the server, so the browser
// sends it automatically. Nothing sensitive is stored in JS or localStorage.
async function call(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
): Promise<Response> {
  try {
    return await fetch(`/api${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
  }
}

// ---------- Mock mode (UI development without a backend) ----------

const MOCK_KEY = "mock-session";
const mockUser: SessionUser = { id: "demo-provider-1", name: "Dr. Maya Okafor", role: "PROVIDER" };
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------- Public API ----------

export async function login(email: string, password: string): Promise<SessionUser> {
  if (MOCK_AUTH) {
    await wait(600);
    const ok =
      email.toLowerCase() === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password;
    if (!ok) throw new ApiError(401, loginMessage(401));
    sessionStorage.setItem(MOCK_KEY, "1");
    return mockUser;
  }

  // TODO(backend): POST /api/auth/login sets the session cookie and returns the user.
  // TODO(csrf): send a CSRF token header once the server issues one.
  const res = await call("/auth/login", "POST", { email, password });
  if (!res.ok) throw new ApiError(res.status, loginMessage(res.status));
  return (await res.json()) as SessionUser;
}

// Returns the signed-in user, or null if there is no valid session.
export async function getSession(): Promise<SessionUser | null> {
  if (MOCK_AUTH) {
    await wait(150);
    return sessionStorage.getItem(MOCK_KEY) ? mockUser : null;
  }

  // TODO(backend): GET /api/auth/me returns the user, or 401 if expired or missing.
  const res = await call("/auth/me", "GET");
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError(res.status, "Couldn't check your session.");
  return (await res.json()) as SessionUser;
}

export async function logout(): Promise<void> {
  if (MOCK_AUTH) {
    sessionStorage.removeItem(MOCK_KEY);
    return;
  }

  // TODO(backend): POST /api/auth/logout deletes the session server-side and clears the cookie.
  await call("/auth/logout", "POST");
}
