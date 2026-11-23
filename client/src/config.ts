// Change the app name here and it updates everywhere.
export const APP_NAME = "Clinic Scheduler";

// When true, login is faked in the browser (see src/api/auth.ts).
export const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === "true";

// Dev-only credentials for mock mode. Never used against a real backend.
export const MOCK_CREDENTIALS = {
  email: "dr.okafor@demo.clinic",
  password: "demo-password",
} as const;
