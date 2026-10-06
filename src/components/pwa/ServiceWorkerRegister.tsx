"use client";

import { useEffect } from "react";

/**
 * Registers the app-shell service worker (public/sw.js) so the site loads
 * offline after a first visit. Registered in production only — a SW in `next dev`
 * intercepts HMR/websocket traffic and makes local development confusing. Renders
 * nothing. See src/lib/offline.ts for the caching strategy it mirrors.
 *
 * In development it also REMOVES a worker left behind by an earlier production
 * run on the same origin (e.g. `next start` on the dev port). Such a worker keeps
 * controlling `next dev` and answers its unhashed chunk URLs (app/page.js, …)
 * cache-first, so the browser runs stale code against fresh server HTML —
 * hydration mismatches and failed hot updates. It is unregistered, its caches
 * are deleted, and the page reloads once without it.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      const wasControlled = !!navigator.serviceWorker.controller;
      (async () => {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((k) => k.startsWith("orovion-")).map((k) => caches.delete(k)));
        }
        // Reload once so this page stops being served by the removed worker.
        // After the reload nothing controls the page, so this cannot loop.
        if (wasControlled && regs.length > 0) window.location.reload();
      })().catch((err) => console.warn("[sw] dev cleanup failed:", err?.message || err));
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("[sw] registration failed:", err?.message || err));
    };

    // Register after load so it never competes with the initial render/hydration.
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
