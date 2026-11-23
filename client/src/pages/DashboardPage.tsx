import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { APP_NAME } from "../config";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="dash">
      <header className="dash__bar">
        <strong>{APP_NAME}</strong>
        <div className="dash__user">
          <span>{user?.name}</span>
          <button type="button" className="btn btn--quiet" onClick={handleSignOut} disabled={busy}>
            Sign out
          </button>
        </div>
      </header>
      <main className="dash__main">
        <h1>Today's schedule</h1>
        <p>You're signed in. The calendar and appointment booking come next.</p>
      </main>
    </div>
  );
}
