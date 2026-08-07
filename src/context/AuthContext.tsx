"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { dok, TOKENS } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { clearOfflineCache, readCache, writeCache } from "@/lib/offline-cache";

const AuthCtx = createContext<any>(null);
export const useAuth = () => useContext(AuthCtx);

// Fixed cache namespace for the signed-in user (independent of userId, so it can be
// read back before we know who the user is — e.g. on an offline reload).
const SELF = "_self";
// Cheap, synchronous "a session probably exists" hint the Landing page reads to
// show a splash instead of flashing the marketing page for a returning visitor.
const HINT_KEY = "dl_has_session";
const setHint = (on: boolean) => {
  try { on ? localStorage.setItem(HINT_KEY, "1") : localStorage.removeItem(HINT_KEY); } catch { /* ignore */ }
};

// The backend marks new users isProfileComplete:false; on reload /profile/me may omit the
// flag, so fall back to "has the minimum basic fields".
const profileComplete = (u) =>
  !u ? false : u.isProfileComplete ?? Boolean(u.fullName && u.gender);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the live session. On a NETWORK failure (offline / server unreachable) or a
  // transient server error, DON'T log out — restore the last-known cached user so a
  // signed-in visitor still opens their homepage instead of the landing page. Only a
  // genuine auth rejection (401/403 = no/expired session) actually logs out.
  const loadSession = async (): Promise<boolean> => {
    try {
      await dok.auth.refresh();
      const data = await dok.profile.me();
      const u = data.user || data;
      setUser(u);
      setHint(true);
      writeCache(SELF, "user", u).catch(() => {});
      connectSocket(u?._id || u?.id);
      return true;
    } catch (e: any) {
      const status = e?.response?.status;
      const authFailure = status === 401 || status === 403;

      if (!authFailure) {
        // Offline / DNS / 5xx — the session may well be valid, we just couldn't
        // reach the server. Keep tokens and show the cached user (if any).
        const cached = await readCache<any>(SELF, "user").catch(() => null);
        if (cached?.data) {
          setUser(cached.data);
          setHint(true);
          return true;
        }
        return false; // no cached user → stay on landing/login until reachable
      }

      // Genuine logout: no/expired session.
      TOKENS.clear();
      setHint(false);
      setUser(null);
      disconnectSocket();
      clearOfflineCache().catch(() => {});
      return false;
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => { await loadSession(); if (alive) setLoading(false); })();

    // When connectivity returns, reconcile the cached/offline session against the
    // server (mint a fresh token, refresh the profile, connect the socket).
    const onOnline = () => { loadSession().catch(() => {}); };
    window.addEventListener("online", onOnline);
    return () => { alive = false; window.removeEventListener("online", onOnline); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If an in-flight refresh ultimately fails (server said the session is gone), the
  // api layer fires this — log out locally.
  useEffect(() => {
    const onExpired = () => {
      TOKENS.clear();
      setHint(false);
      disconnectSocket();
      setUser(null);
      clearOfflineCache(); // drop this session's cached data on forced logout
    };
    window.addEventListener("dl:auth-expired", onExpired);
    return () => window.removeEventListener("dl:auth-expired", onExpired);
  }, []);

  // Called after verify-otp / google succeed. Web responses carry accessToken + csrfToken + user
  // (the refresh token is in an httpOnly cookie, not in JS).
  const setSession = ({ accessToken, csrfToken, user: u }) => {
    TOKENS.set({ accessToken, csrfToken });
    setUser(u);
    setHint(true);
    writeCache(SELF, "user", u).catch(() => {});
    connectSocket(u?._id || u?.id);
  };

  // Merge fresh fields into the current user (e.g. after onboarding completes the profile).
  const updateUser = (patch) =>
    setUser((u) => {
      const next = { ...(u || {}), ...patch };
      writeCache(SELF, "user", next).catch(() => {});
      return next;
    });

  const logout = async () => {
    try {
      await dok.auth.logout();
    } catch {
      /* clear locally regardless of the network result */
    }
    TOKENS.clear();
    setHint(false);
    disconnectSocket();
    setUser(null);
    clearOfflineCache(); // privacy: clear cached data so the next user starts clean
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        demo: false, // demo mode removed — the app is fully backed by the live API now
        isProfileComplete: profileComplete(user),
        setSession,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
