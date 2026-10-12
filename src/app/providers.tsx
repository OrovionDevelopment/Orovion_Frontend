"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CallProvider } from "@/context/CallContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppearanceProvider } from "@/context/AppearanceContext";
import { ToastProvider } from "@/components/ui/Toast";
import CallRoot from "@/components/call/CallRoot";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import OfflineSync from "@/components/pwa/OfflineSync";
import Cursor from "@/components/marketing/Cursor";

// Client-side providers wrapper (AuthProvider holds session, demo state, socket).
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppearanceProvider>
        <ToastProvider>
          <AuthProvider>
            <CallProvider>
              {children}
              <CallRoot />
              <ServiceWorkerRegister />
              <OfflineSync />
              {/* One animated cursor for the whole site: landing, login, onboarding and every page after login. */}
              <Cursor />
            </CallProvider>
          </AuthProvider>
        </ToastProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
