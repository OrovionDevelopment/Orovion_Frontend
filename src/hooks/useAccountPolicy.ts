"use client";
// The server's account rules — chiefly how long a deleted account can be
// restored — from GET /api/public/account-policy. Every screen that explains the
// rules reads it from here, so the copy can never drift from what the backend
// does again (Settings once said "6 months" while the backend used 30 days).
//
// Fetched once per page load and shared by every caller. While loading, or if
// the request fails, callers get null and must use number-free wording
// ("the recovery period") — never a stale number.
import { useEffect, useState } from "react";
import { dok } from "@/lib/api";

export type AccountPolicy = {
  recoveryDays: number;
  restoreBy: string;      // "login"
  afterRecovery: string;  // "archived"
  erasure: string;        // "admin_only"
};

let cached: AccountPolicy | null = null;
let inflight: Promise<AccountPolicy | null> | null = null;

export const loadAccountPolicy = (): Promise<AccountPolicy | null> => {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  const request: Promise<AccountPolicy | null> = dok.account.policy()
    .then((p: any) => {
      if (p && Number.isInteger(p.recoveryDays) && p.recoveryDays > 0) cached = p;
      return cached;
    })
    .catch(() => null)
    .finally(() => { inflight = null; });
  inflight = request;
  return request;
};

/** The policy, or null until it loads (or if it cannot). */
export function useAccountPolicy(): AccountPolicy | null {
  const [policy, setPolicy] = useState<AccountPolicy | null>(cached);
  useEffect(() => {
    let alive = true;
    loadAccountPolicy().then((p) => { if (alive) setPolicy(p); });
    return () => { alive = false; };
  }, []);
  return policy;
}

/** "30 days" — or "the recovery period" when the number is not known. */
export const recoveryPhrase = (p: AccountPolicy | null) => (p?.recoveryDays ? `${p.recoveryDays} days` : "the recovery period");
