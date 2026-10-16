"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "@/lib/router";
import { AnalyticsDashboard } from "@/features/analytics";
import {
  ShieldCheck, LayoutDashboard, Users2, FileStack, BadgeCheck, Flag, MessageSquareText,
  Trash2, ScrollText, LogOut, Loader2, KeyRound, UserRound, Search, X, ChevronRight,
  CheckCircle2, XCircle, RotateCcw, Eye, Ban, UserX, RefreshCw, Circle, AlertTriangle,
  Stethoscope, GraduationCap, User, Film, FileText, BookOpen, Dot,
  Banknote, Send, Receipt, ArrowLeft, ExternalLink,
  Wallet, TrendingUp, Download, SlidersHorizontal, Landmark, PiggyBank, CalendarDays, Star,
  Info, Archive, Clock,
} from "lucide-react";
import { Avatar, Logo, Spinner } from "@/components/ui/Primitives";
import { RowsSkeleton, StatGridSkeleton } from "@/components/ui/Skeletons";
import NavArrows from "@/components/ui/NavArrows";
import { dok, ADMIN_TOKENS } from "@/lib/api";
import { cn, compact, timeAgo, formatStat, formatDate, daysUntil } from "@/lib/utils";
import { useAccountPolicy, recoveryPhrase } from "@/hooks/useAccountPolicy";

/**
 * Operator-only admin console at /admin — fully separate from the product app.
 * No link points here; operators reach it by URL. Login uses the server's env
 * ADMIN_USERNAME / ADMIN_PASSWORD, verified against the backend, which returns a
 * short-lived admin JWT (held in sessionStorage by ADMIN_TOKENS). The session
 * lasts for the browser tab.
 */

/* =========================================================================
   Root: auth gate
   ========================================================================= */
export default function Admin() {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (ADMIN_TOKENS.access) {
        try {
          const { admin } = await dok.admin.me();
          if (alive) setAdmin(admin);
        } catch { ADMIN_TOKENS.clear(); }
      }
      if (alive) setReady(true);
    })();
    const onExpire = () => setAdmin(null);
    window.addEventListener("dl:admin-expired", onExpire);
    return () => { alive = false; window.removeEventListener("dl:admin-expired", onExpire); };
  }, []);

  const signOut = async () => { await dok.admin.logout(); setAdmin(null); };

  if (!ready) return <div className="grid min-h-screen place-items-center bg-ink-50"><Spinner className="h-8 w-8" /></div>;
  if (!admin) return <AdminGate onIn={setAdmin} />;
  return <AdminConsole admin={admin} onSignOut={signOut} />;
}

/* =========================================================================
   Login gate
   ========================================================================= */
function AdminGate({ onIn }: { onIn: (a: any) => void }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.username.trim().length >= 1 && form.password.length >= 1;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true); setErr("");
    try {
      const { admin } = await dok.admin.login(form.username.trim(), form.password);
      onIn(admin);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Access denied. Check your credentials.");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4 py-10">
      <NavArrows variant="floating" className="" />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Logo withText={false} size={28} light />
          <span className="font-display text-lg font-extrabold text-white">Orovion <span className="text-brand-300">Admin</span></span>
        </div>
        <form onSubmit={submit} className="anim-pop rounded-3xl bg-surface p-6 shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow"><ShieldCheck size={22} /></span>
            <div>
              <h1 className="font-display text-lg font-extrabold text-ink-900">Restricted area</h1>
              <p className="text-xs text-ink-500">Sign in with your admin credentials.</p>
            </div>
          </div>

          <label className="mb-1 block text-xs font-bold text-ink-600" htmlFor="adm-user">User ID</label>
          <div className="relative mb-3">
            <UserRound size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input id="adm-user" value={form.username} onChange={set("username")} placeholder="admin username" autoComplete="username" className="input pl-9" />
          </div>

          <label className="mb-1 block text-xs font-bold text-ink-600" htmlFor="adm-pass">Password</label>
          <div className="relative">
            <KeyRound size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input id="adm-pass" value={form.password} onChange={set("password")} type="password" placeholder="password" autoComplete="current-password" className="input pl-9" />
          </div>

          {err && <p role="alert" className="anim-pop mt-3 rounded-xl bg-danger-50 px-3 py-2 text-xs font-semibold text-danger-700">{err}</p>}

          <button type="submit" disabled={!valid || busy} className="btn-primary mt-4 w-full py-3 text-sm">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Enter console
          </button>
        </form>
        <button onClick={() => nav("/")} className="mx-auto mt-5 block text-xs text-white/50 transition hover:text-white/80">← Back to orovion.app</button>
      </div>
    </div>
  );
}

/* =========================================================================
   Console shell
   ========================================================================= */
const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users2 },
  { key: "content", label: "Content", icon: FileStack },
  { key: "verifications", label: "Verifications", icon: BadgeCheck },
  { key: "transactions", label: "Transactions", icon: Receipt },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "settlements", label: "Settlements", icon: Banknote },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "feedback", label: "Feedback", icon: MessageSquareText },
  { key: "ratings", label: "Consultation ratings", icon: Star },
  { key: "deletions", label: "Deletions", icon: Trash2 },
  { key: "audit", label: "Audit log", icon: ScrollText },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
];

function AdminConsole({ admin, onSignOut }: { admin: any; onSignOut: () => void }) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="glass sticky top-0 z-40 border-b border-ink-900/[.06]">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Logo withText={false} size={28} />
          <span className="font-display font-extrabold text-ink-900">Admin console</span>
          <span className="chip bg-brand-50 text-brand-700"><ShieldCheck size={13} /> {admin?.role === "SUPER_ADMIN" ? "Super admin" : admin?.role}</span>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold leading-tight text-ink-900">{admin?.username}</p>
          </div>
          <button onClick={onSignOut} title="Sign out" className="press ml-2 flex items-center gap-1.5 rounded-full border border-ink-900/[.1] bg-surface px-3 py-1.5 text-xs font-bold text-ink-600 transition hover:border-danger-500/40 hover:text-danger-500">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <nav className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            {NAV.map((n) => (
              <button key={n.key} onClick={() => setTab(n.key)}
                className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  tab === n.key ? "bg-brand-600 text-white shadow-glow" : "text-ink-600 hover:bg-surface")}>
                <n.icon size={17} /> {n.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile tab pills */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {NAV.map((n) => (
              <button key={n.key} onClick={() => setTab(n.key)}
                className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition",
                  tab === n.key ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}>
                <n.icon size={14} /> {n.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <Overview />}
          {tab === "users" && <UsersSection />}
          {tab === "content" && <ContentSection />}
          {tab === "verifications" && <VerificationsSection />}
          {tab === "transactions" && <TransactionsSection />}
          {tab === "payments" && <PaymentsSection onNav={setTab} />}
          {tab === "settlements" && <SettlementsSection />}
          {tab === "reports" && <ReportsSection />}
          {tab === "feedback" && <FeedbackSection />}
          {tab === "ratings" && <RatingsSection />}
          {tab === "deletions" && <DeletionsSection />}
          {tab === "audit" && <AuditSection />}
          {/* Isolated analytics module — rendered inside the secret admin console
              (not a /admin/* route, which middleware 404s). */}
          {tab === "analytics" && <AnalyticsDashboard />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Shared bits
   ========================================================================= */
function Stat({ label, value, tone = "ink" }: { label: string; value: any; tone?: string }) {
  const tones: any = {
    ink: "text-ink-900", brand: "text-brand-600", emerald: "text-emerald-600",
    amber: "text-amber-600", rose: "text-rose-600", sky: "text-sky-600",
  };
  return (
    <div className="card p-4">
      {/* formatStat: numbers compacted, formatted money as-is, null → "—" */}
      <p className={cn("text-2xl font-extrabold", tones[tone] || tones.ink)}>{formatStat(value)}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}

// A load that failed must not look like "nothing here": say so, and offer a retry.
const errorText = (e: any) => e?.response?.data?.message || (e?.request ? "The server could not be reached." : "Something went wrong.");
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card py-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600"><AlertTriangle size={26} /></span>
      <p className="mt-3 font-semibold text-ink-900">Couldn't load this</p>
      <p className="mx-auto max-w-md text-sm text-ink-500">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-outline mx-auto mt-4 px-4 py-2 text-sm"><RefreshCw size={14} /> Try again</button>}
    </div>
  );
}

/** Request sequencing for a list: `const isCurrent = begin()` at the start of a
    load; drop the response when `!isCurrent()`. A slow answer for the previous
    filter or tab must never overwrite (or be appended to) the current one. */
function useRequestSeq() {
  const seq = useRef(0);
  return useCallback(() => {
    const id = ++seq.current;
    return () => id === seq.current;
  }, []);
}

function SectionHead({ title, subtitle, right }: any) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Empty({ icon: Icon = CheckCircle2, title = "Nothing here", sub = "" }) {
  return (
    <div className="card py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600"><Icon size={26} /></span>
      <p className="mt-3 font-semibold text-ink-900">{title}</p>
      {sub && <p className="text-sm text-ink-500">{sub}</p>}
    </div>
  );
}

const STATUS_CHIP: any = {
  ACTIVE: "bg-emerald-50 text-emerald-600", DEACTIVATED: "bg-ink-900/[.06] text-ink-600",
  SUSPENDED: "bg-rose-50 text-rose-600", PENDING_DELETION: "bg-amber-50 text-amber-600",
  FROZEN: "bg-sky-50 text-sky-600",
};
const STATUS_LABEL: any = {
  ACTIVE: "Active", DEACTIVATED: "Deactivated", SUSPENDED: "Suspended",
  PENDING_DELETION: "Pending deletion", FROZEN: "Archived",
};

// The account rules in plain words, shown to admins next to the controls that
// change them. The recovery period comes from the server (account-policy), so
// this text can never disagree with what the backend actually does.
function AccountRulesCard() {
  const period = recoveryPhrase(useAccountPolicy());
  return (
    <div className="card p-4 text-sm text-ink-600">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-400"><Info size={14} /> How accounts work</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Deactivate</b> — the account is hidden and signed out; nothing is deleted. Logging in again brings it back.</li>
        <li><b>Delete (by the user)</b> — a soft delete. Hidden at once; logging in within {period} restores everything.</li>
        <li><b>After {period}</b> — the account is archived (frozen): data is kept, the user can no longer restore it, and their phone/Google/Apple login is released so they can sign up again.</li>
        <li><b>Erase permanently</b> — only an admin can do this, from a user's page. Posts, Pulses, messages and files are removed; payment records and this audit log are kept.</li>
        <li><b>Suspend</b> — the user cannot sign in and their content is hidden, for a set time or permanently. They are told the reason. A timed suspension ends by itself.</li>
      </ul>
    </div>
  );
}
const ROLE_ICON: any = { doctor: Stethoscope, student: GraduationCap, general_user: User };

/* =========================================================================
   Overview
   ========================================================================= */
function Overview() {
  const [o, setO] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async (refresh = false) => {
    setLoading(true); setError("");
    try { const d = await dok.admin.overview(refresh); setO(d.overview); } catch (e) { setError(errorText(e)); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading && !o) return <StatGridSkeleton count={6} />;
  if (!o) return <ErrorState message={error || "The overview could not be built."} onRetry={() => load(true)} />;

  const u = o.users, c = o.content, cs = o.consultations;
  const sum = (...xs: any[]) => (xs.some((x) => x == null) ? null : xs.reduce((a, b) => a + b, 0));
  return (
    <div className="space-y-6">
      <SectionHead title="Overview" subtitle={`Live snapshot · presence: ${o.presenceSource}`}
        right={<button onClick={() => load(true)} className="btn-outline px-3 py-2 text-xs"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button>} />

      {o.partial && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Some numbers could not be loaded right now ({(o.unavailable || []).join(", ")}). They show as "—". Refresh to try again.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total users" value={u.total} tone="brand" />
        <Stat label="Online now" value={u.onlineNow} tone="emerald" />
        <Stat label="Offline" value={u.offline} />
        <Stat label="Active (7d)" value={u.active7d} tone="sky" />
        <Stat label="Verified pros" value={u.verified} tone="emerald" />
        <Stat label="New (7d)" value={u.new7d} tone="brand" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="By role">
          <Row label="Doctors" value={u.byRole.doctor} icon={Stethoscope} />
          <Row label="Students" value={u.byRole.student} icon={GraduationCap} />
          <Row label="General users" value={u.byRole.general_user} icon={User} />
        </Panel>
        <Panel title="Account status">
          <Row label="Active" value={u.byStatus.active} tone="emerald" />
          <Row label="Suspended" value={u.byStatus.suspended} tone="rose" />
          <Row label="Deactivated" value={u.byStatus.deactivated} />
          <Row label="Pending deletion" value={u.byStatus.pending_deletion} tone="amber" />
          <Row label="Archived" value={u.byStatus.frozen} />
        </Panel>
        <Panel title="Deletions">
          <Row label="In recovery period" value={o.deletions.scheduled} tone="amber" />
          <Row label="Archived (recovery ended)" value={o.deletions.archived} />
          <Row label="Erased by an admin (all-time)" value={o.deletions.permanentAllTime} tone="rose" />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Content">
          <Row label="Posts" value={c.posts.post} icon={FileText} />
          <Row label="Research" value={c.posts.research} icon={BookOpen} />
          <Row label="Case studies" value={c.posts.case_study == null ? null : c.posts.case_study + (c.clinicalCases ?? 0)} icon={FileStack} />
          <Row label="Pulses" value={c.pulses} icon={Film} />
        </Panel>
        <Panel title="Consultations">
          <Row label="Requests (paid)" value={cs.total} tone="brand" />
          <Row label="Waiting for the doctor" value={cs.awaitingDoctor} tone="amber" />
          <Row label="Scheduled" value={cs.scheduled} tone="sky" />
          <Row label="Completed" value={cs.completed} tone="emerald" />
          <Row label="Declined / cancelled / missed" value={cs.notFulfilled} />
          <Row label="Refunded payments" value={cs.refunded} />
        </Panel>
        <Panel title="Feedback & moderation">
          <Row label="New feedback" value={o.feedback.byStatus?.new} tone="brand" />
          <Row label="Feedback total" value={o.feedback.total} />
          <Row label="Reports pending" value={o.reports.pending} tone="rose" />
          <Row label="Doctor verifications pending" value={sum(o.verifications.doctor.submitted, o.verifications.doctor.inReview)} tone="amber" />
          <Row label="Student verifications pending" value={o.verifications.student.submitted} tone="amber" />
        </Panel>
      </div>

      <AccountRulesCard />
    </div>
  );
}

function Panel({ title, children }: any) {
  return (
    <div className="card p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">{title}</p>
      <div className="divide-y divide-ink-900/[.05]">{children}</div>
    </div>
  );
}
function Row({ label, value, tone = "ink", icon: Icon }: any) {
  const tones: any = { ink: "text-ink-900", brand: "text-brand-600", emerald: "text-emerald-600", amber: "text-amber-600", rose: "text-rose-600", sky: "text-sky-600" };
  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex items-center gap-2 text-sm text-ink-600">{Icon && <Icon size={15} className="text-ink-400" />}{label}</span>
      {/* null = the owning service is unreachable: "—", not a misleading 0 */}
      <span className={cn("text-sm font-extrabold", tones[tone])}>{formatStat(value)}</span>
    </div>
  );
}

/* =========================================================================
   Payments — dedicated financial workspace (collections, revenue, refunds)
   ========================================================================= */
const PAY_CHIP: any = {
  CAPTURED: "bg-emerald-50 text-emerald-600", CREATED: "bg-amber-50 text-amber-600",
  PROCESSING: "bg-amber-50 text-amber-600", FAILED: "bg-rose-50 text-rose-600",
  REFUNDED: "bg-sky-50 text-sky-600", REFUND_PENDING: "bg-amber-50 text-amber-600",
};
const PAY_LABEL: any = {
  CAPTURED: "Success", CREATED: "Pending", PROCESSING: "Pending",
  FAILED: "Failed", REFUNDED: "Refunded", REFUND_PENDING: "Refund pending",
};
const fmtMethod = (m: any) => {
  if (!m) return "—";
  const map: any = { upi: "UPI", card: "Card", netbanking: "Netbanking", wallet: "Wallet", emi: "EMI", paylater: "Pay Later", bank_transfer: "Bank Transfer" };
  return map[String(m).toLowerCase()] || String(m).toUpperCase();
};
const KPI_TONE: any = {
  brand: "bg-brand-50 text-brand-600", emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600",
};
const PRESETS: any[] = [
  ["today", "Today"], ["yesterday", "Yesterday"], ["7d", "Last 7 Days"],
  ["30d", "Last 30 Days"], ["month", "This Month"], ["lastmonth", "Last Month"], ["custom", "Custom Range"],
];
const _sod = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const _eod = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
function presetRange(key: string): { from: string; to: string } {
  const now = new Date(); const iso = (d: Date) => d.toISOString();
  switch (key) {
    case "today": return { from: iso(_sod(now)), to: iso(_eod(now)) };
    case "yesterday": { const y = new Date(now.getTime() - 86400000); return { from: iso(_sod(y)), to: iso(_eod(y)) }; }
    case "7d": return { from: iso(_sod(new Date(now.getTime() - 6 * 86400000))), to: iso(_eod(now)) };
    case "month": return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(_eod(now)) };
    case "lastmonth": return { from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: iso(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)) };
    default: return { from: iso(_sod(new Date(now.getTime() - 29 * 86400000))), to: iso(_eod(now)) };
  }
}
const fmtDay = (iso: any) => { try { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); } catch { return ""; } };

// Like Row but renders the value verbatim (no compact()) — for currency/% strings.
function PRow({ label, value, tone = "ink" }: any) {
  const tones: any = { ink: "text-ink-900", emerald: "text-emerald-600", rose: "text-rose-600", amber: "text-amber-600", brand: "text-brand-600" };
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-ink-600">{label}</span>
      <span className={cn("text-sm font-extrabold", tones[tone] || tones.ink)}>{value}</span>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, subTone, tone = "brand" }: any) {
  return (
    <div className="card p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", KPI_TONE[tone])}><Icon size={16} /></span>
        <p className="text-[11px] font-medium leading-tight text-ink-500">{label}</p>
      </div>
      <p className="text-[22px] font-extrabold leading-none text-ink-900">{value}</p>
      {sub && <p className={cn("mt-1.5 text-[11px] font-medium", subTone || "text-ink-400")}>{sub}</p>}
    </div>
  );
}

function RevenueChart({ series }: { series: any[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 700, H = 240, pl = 10, pr = 10, pt = 14, pb = 22;
  const n = series.length;
  const max = Math.max(1, ...series.map((s) => Number(s.grossPaise) || 0));
  const X = (i: number) => (n <= 1 ? W / 2 : pl + (i / (n - 1)) * (W - pl - pr));
  const Y = (v: number) => pt + (1 - (Number(v) || 0) / max) * (H - pt - pb);
  const pts = series.map((s, i) => [X(i), Y(s.grossPaise)]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = n ? `${line} L${X(n - 1).toFixed(1)},${H - pb} L${X(0).toFixed(1)},${H - pb} Z` : "";
  const grid = [0, 0.25, 0.5, 0.75, 1];
  const step = Math.max(1, Math.ceil(n / 6));
  return (
    <div className="relative w-full" style={{ aspectRatio: "700 / 240" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        {grid.map((g, i) => <line key={i} x1={pl} x2={W - pr} y1={Y(max * g)} y2={Y(max * g)} className="stroke-ink-900/[.06]" strokeWidth={1} />)}
        {area && <path d={area} className="fill-brand-500/10" />}
        {line && <path d={line} className="stroke-brand-500" strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 4 : 2.6} className="fill-brand-500" />)}
        {pts.map((_, i) => <rect key={"h" + i} x={X(i) - (W / Math.max(n, 1)) / 2} y={0} width={W / Math.max(n, 1)} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />)}
      </svg>
      <div className="pointer-events-none absolute inset-x-2 bottom-0 flex justify-between text-[10px] text-ink-400">
        {series.filter((_, i) => i % step === 0).map((s, i) => <span key={i}>{fmtDay(s.period)}</span>)}
      </div>
      {hover != null && series[hover] && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-center text-[11px] text-white shadow-lg"
          style={{ left: `${(X(hover) / W) * 100}%`, top: `${(Y(series[hover].grossPaise) / H) * 100}%` }}>
          <div className="font-semibold">{fmtDay(series[hover].period)}</div>
          <div>{rupee(series[hover].grossPaise)}</div>
        </div>
      )}
    </div>
  );
}

function Donut({ segs }: { segs: { pct: number; cls: string }[] }) {
  const R = 42, C = 2 * Math.PI * R; let off = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={60} cy={60} r={R} fill="none" className="stroke-ink-900/[.06]" strokeWidth={13} />
      {segs.map((s, i) => {
        const len = Math.max(0, (s.pct / 100) * C);
        const el = <circle key={i} cx={60} cy={60} r={R} fill="none" className={s.cls} strokeWidth={13} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
        off += len; return el;
      })}
    </svg>
  );
}

function PaymentsSection({ onNav }: { onNav: (k: string) => void }) {
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [showDates, setShowDates] = useState(false);
  const [groupBy, setGroupBy] = useState("day");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: "", minRs: "", maxRs: "", search: "" });

  const [sum, setSum] = useState<any>(null);
  const [rev, setRev] = useState<any[]>([]);
  const [pays, setPays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailBusy, setDetailBusy] = useState(false);

  const range = useCallback(() => (preset === "custom" && custom.from && custom.to
    ? { from: new Date(custom.from).toISOString(), to: _eod(new Date(custom.to)).toISOString() }
    : presetRange(preset)), [preset, custom]);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    const r = range();
    const payParams: any = { ...r, limit: showAll ? 50 : 8 };
    if (filters.status) payParams.status = filters.status;
    if (filters.search) payParams.search = filters.search;
    if (filters.minRs) payParams.minPaise = Math.round(Number(filters.minRs) * 100);
    if (filters.maxRs) payParams.maxPaise = Math.round(Number(filters.maxRs) * 100);
    try {
      const [s, v, p] = await Promise.all([
        dok.admin.paymentsSummary(r),
        dok.admin.paymentsRevenue({ ...r, groupBy }),
        dok.admin.payments(payParams),
      ]);
      setSum(s); setRev(v.series || []); setPays(p.payments || []);
    } catch (e) { setErr(errorText(e)); }
    setLoading(false);
  }, [range, groupBy, showAll, filters]);
  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: string) => {
    setDetailBusy(true); setDetail({ loading: true });
    try { const d = await dok.admin.paymentDetail(id); setDetail(d.payment); }
    catch { setDetail({ failed: true }); }   // the drawer says it couldn't load
    setDetailBusy(false);
  };
  const openInvoice = async (id: string) => {
    try { const r = await dok.admin.paymentInvoice(id); if (r?.url) window.open(r.url, "_blank", "noopener"); } catch { /* ignore */ }
  };

  const exportCsv = () => {
    const head = ["Time", "Payment ID", "Patient", "Doctor", "Amount", "Platform Fee", "Doctor Earning", "Status", "Consultation ID"];
    const rows = [head, ...pays.map((p) => [
      fmtDateTime(p.capturedAt || p.createdAt), p.razorpayPaymentId || p.id, p.patientName || "",
      p.doctorName || "", (p.totalPaise / 100).toFixed(2), (p.platformFeePaise / 100).toFixed(2),
      (p.doctorEarningPaise / 100).toFixed(2), p.status, p.requestId || "",
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `payments_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const k = sum?.kpis, br = sum?.breakdown, an = sum?.analytics, rf = sum?.refunds, st = sum?.settlements, fin = sum?.financial;
  const presetLabel = PRESETS.find((p) => p[0] === preset)?.[1] || "Last 30 Days";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Payments</h1>
          <p className="text-sm text-ink-500">Track platform collections, revenue and transactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowDates((v) => !v)} className="btn-outline px-3 py-2 text-xs">
              <CalendarDays size={14} /> {presetLabel}
            </button>
            {showDates && (
              <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-ink-900/[.08] bg-surface p-1 shadow-xl">
                {PRESETS.map(([key, label]) => (
                  <button key={key} onClick={() => { setPreset(key); if (key !== "custom") setShowDates(false); }}
                    className={cn("block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition",
                      preset === key ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-900/[.04]")}>
                    {label}
                  </button>
                ))}
                {preset === "custom" && (
                  <div className="space-y-2 border-t border-ink-900/[.06] p-2">
                    <input type="date" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} className="input h-8 w-full text-xs" />
                    <input type="date" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} className="input h-8 w-full text-xs" />
                    <button onClick={() => setShowDates(false)} className="btn-primary w-full py-1.5 text-xs">Apply</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={exportCsv} className="btn-outline px-3 py-2 text-xs"><Download size={14} /> Export</button>
          <button onClick={() => setShowFilters((v) => !v)} className={cn("px-3 py-2 text-xs", showFilters ? "btn-primary" : "btn-outline")}>
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card flex flex-wrap items-end gap-3 p-4">
          <label className="text-xs font-bold text-ink-600">Status
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="input mt-1 block h-9 text-xs">
              <option value="">All</option><option value="CAPTURED">Success</option><option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option><option value="CREATED">Pending</option>
            </select>
          </label>
          <label className="text-xs font-bold text-ink-600">Min ₹
            <input value={filters.minRs} onChange={(e) => setFilters((f) => ({ ...f, minRs: e.target.value }))} inputMode="numeric" className="input mt-1 block h-9 w-24 text-xs" /></label>
          <label className="text-xs font-bold text-ink-600">Max ₹
            <input value={filters.maxRs} onChange={(e) => setFilters((f) => ({ ...f, maxRs: e.target.value }))} inputMode="numeric" className="input mt-1 block h-9 w-24 text-xs" /></label>
          <label className="text-xs font-bold text-ink-600">Search
            <input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="patient / doctor / payment id" className="input mt-1 block h-9 w-56 text-xs" /></label>
          <button onClick={() => setFilters({ status: "", minRs: "", maxRs: "", search: "" })} className="btn-outline px-3 py-2 text-xs">Reset</button>
        </div>
      )}

      {loading && !sum ? <StatGridSkeleton count={6} />
        : err ? <ErrorState message={err} onRetry={load} />
          : (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <KpiCard icon={Wallet} tone="brand" label="Total Money Collected" value={rupee(k?.grossPaise)}
                  sub={k?.grossDeltaPct != null ? `${k.grossDeltaPct >= 0 ? "▲" : "▼"} ${Math.abs(k.grossDeltaPct)}% vs previous period` : "vs previous period"}
                  subTone={k?.grossDeltaPct >= 0 ? "text-emerald-600" : "text-rose-600"} />
                <KpiCard icon={TrendingUp} tone="sky" label="Today's Collection" value={rupee(k?.todayPaise)} sub="captured today" />
                <KpiCard icon={CalendarDays} tone="sky" label="This Month Collection" value={rupee(k?.monthPaise)} sub="month to date" />
                <KpiCard icon={PiggyBank} tone="emerald" label="Platform Revenue" value={rupee(k?.platformRevenuePaise)} sub={`${k?.platformRevenuePct ?? 0}% of gross collection`} />
                <KpiCard icon={Users2} tone="amber" label="Doctor Liability" value={rupee(k?.doctorLiabilityPaise)} sub="owed to doctors" />
                <KpiCard icon={Landmark} tone="brand" label="Total Settled" value={rupee(k?.totalSettledPaise)} sub="paid to doctors" />
              </div>

              {/* Revenue + breakdown + analytics + refunds */}
              <div className="grid gap-4 xl:grid-cols-5">
                <div className="card p-5 xl:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-extrabold text-ink-900">Revenue Overview</h3>
                    <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="input h-8 text-xs">
                      <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option>
                    </select>
                  </div>
                  {rev.length === 0 ? <div className="grid h-48 place-items-center text-sm text-ink-400">No revenue in this range</div> : <RevenueChart series={rev} />}
                </div>

                <Panel title="Collection Breakdown">
                  <div className="flex items-center gap-4 pt-2">
                    <Donut segs={[
                      { pct: br?.successful.pct || 0, cls: "stroke-emerald-500" },
                      { pct: br?.refunded.pct || 0, cls: "stroke-sky-500" },
                      { pct: br?.failed.pct || 0, cls: "stroke-rose-500" },
                    ]} />
                    <div className="flex-1 space-y-3 text-sm">
                      {[["Successful", "bg-emerald-500", br?.successful], ["Refunded", "bg-sky-500", br?.refunded], ["Failed", "bg-rose-500", br?.failed]].map(([lbl, dot, d]: any) => (
                        <div key={lbl}>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-ink-700"><span className={cn("h-2.5 w-2.5 rounded-full", dot)} /> {lbl}</span>
                            <span className="font-bold text-ink-900">{d?.pct ?? 0}%</span>
                          </div>
                          <p className="pl-4 text-xs text-ink-400">{rupee(d?.amountPaise)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Payment Analytics">
                  <PRow label="Total Payments" value={an?.total ?? 0} />
                  <PRow label="Successful" value={an?.successCount ?? 0} tone="emerald" />
                  <PRow label="Failed" value={an?.failedCount ?? 0} tone="rose" />
                  <PRow label="Refunded" value={an?.refundedCount ?? 0} />
                  <PRow label="Success Rate" value={`${an?.successRatePct ?? 0}%`} tone="emerald" />
                </Panel>

                <Panel title="Refund Summary">
                  <PRow label="Total Refunded" value={rupee(rf?.totalPaise)} />
                  <PRow label="Refunds (This Month)" value={rupee(rf?.monthPaise)} />
                  <PRow label="Refunds (Today)" value={rupee(rf?.todayPaise)} />
                  <PRow label="Refund Rate" value={`${rf?.refundRatePct ?? 0}%`} tone="amber" />
                </Panel>
              </div>

              {/* Recent payments + top doctors + settlement summary */}
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="card overflow-hidden p-0 xl:col-span-2">
                  <div className="flex items-center justify-between px-5 py-4">
                    <h3 className="font-display text-lg font-extrabold text-ink-900">Recent Payments</h3>
                    <button onClick={() => setShowAll((v) => !v)} className="text-xs font-bold text-brand-600 hover:text-brand-700">{showAll ? "Show less" : "View All"}</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-y border-ink-900/[.06] text-left text-xs text-ink-500">
                          <th className="px-5 py-2.5 font-semibold">Time</th>
                          <th className="px-3 py-2.5 font-semibold">Payment ID</th>
                          <th className="px-3 py-2.5 font-semibold">Patient</th>
                          <th className="px-3 py-2.5 font-semibold">Doctor</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Fee</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Earning</th>
                          <th className="px-3 py-2.5 font-semibold">Status</th>
                          <th className="px-3 py-2.5 font-semibold">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pays.length === 0 ? (
                          <tr><td colSpan={9} className="px-5 py-10 text-center text-sm text-ink-400">No payments in this range</td></tr>
                        ) : pays.map((p) => (
                          <tr key={p.id} onClick={() => openDetail(p.id)} className="cursor-pointer border-b border-ink-900/[.04] transition last:border-0 hover:bg-ink-900/[.02]">
                            <td className="px-5 py-3 text-xs text-ink-500">{fmtDateTime(p.capturedAt || p.createdAt)}</td>
                            <td className="px-3 py-3 font-mono text-[11px] text-ink-500">{p.razorpayPaymentId || p.id.slice(0, 14)}</td>
                            <td className="px-3 py-3 font-medium text-ink-900">{p.patientName || "—"}</td>
                            <td className="px-3 py-3 text-ink-700">{p.doctorName ? `Dr. ${p.doctorName}` : "—"}</td>
                            <td className="px-3 py-3 text-right font-bold tabular-nums text-ink-900">{rupee(p.totalPaise)}</td>
                            <td className="px-3 py-3 text-right tabular-nums text-ink-500">{rupee(p.platformFeePaise)}</td>
                            <td className="px-3 py-3 text-right tabular-nums text-emerald-600">{rupee(p.doctorEarningPaise)}</td>
                            <td className="px-3 py-3"><span className={cn("chip", PAY_CHIP[p.status] || PAY_CHIP.CREATED)}>{PAY_LABEL[p.status] || p.status}</span></td>
                            <td className="px-3 py-3 text-xs text-ink-600">{fmtMethod(p.method)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="card p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-display text-base font-extrabold text-ink-900">Top Doctors <span className="text-xs font-medium text-ink-400">(this period)</span></h3>
                    </div>
                    <div className="divide-y divide-ink-900/[.05]">
                      {(sum?.topDoctors || []).length === 0 ? <p className="py-4 text-sm text-ink-400">No earnings yet</p>
                        : sum.topDoctors.map((d: any) => (
                          <div key={d.doctorId} className="flex items-center justify-between py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink-900">Dr. {d.fullName}</p>
                              <p className="truncate text-xs text-ink-400">{d.specialization || "—"}</p>
                            </div>
                            <span className="font-bold tabular-nums text-ink-900">{rupee(d.earningsPaise)}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-display text-base font-extrabold text-ink-900">Settlement Summary</h3>
                      <button onClick={() => onNav("settlements")} className="text-xs font-bold text-brand-600 hover:text-brand-700">View All</button>
                    </div>
                    <PRow label="Pending Settlements" value={rupee(st?.pendingPaise)} tone="amber" />
                    <PRow label="Paid Settlements" value={rupee(st?.paidPaise)} tone="emerald" />
                    <PRow label="Failed Settlements" value={rupee(st?.failedPaise)} tone="rose" />
                    <PRow label="This Month Settlements" value={st?.monthCount ?? 0} />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-ink-600">Last Settlement</span>
                      <span className="text-right text-sm">
                        <span className="block font-semibold text-ink-900">{st?.last?.paidAt ? fmtDay(st.last.paidAt) : "—"}</span>
                        {st?.last && <span className="block text-xs text-ink-400">{rupee(st.last.netPaise)}</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial summary */}
              <Panel title="Financial Summary">
                <div className="grid gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-5">
                  {[["Gross Collection", fin?.grossCollectionPaise, "ink"], ["Platform Fee", fin?.platformFeePaise, "brand"],
                    ["Refunds", fin?.refundsPaise, "rose"], ["Net Platform Revenue", fin?.netRevenuePaise, "emerald"],
                    ["Outstanding Liability", fin?.outstandingLiabilityPaise, "amber"]].map(([lbl, val, tone]: any) => (
                    <div key={lbl}>
                      <p className="text-xs text-ink-500">{lbl}</p>
                      <p className={cn("mt-0.5 text-lg font-extrabold",
                        tone === "emerald" ? "text-emerald-600" : tone === "rose" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : tone === "brand" ? "text-brand-600" : "text-ink-900")}>
                        {rupee(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowAll(true)} className="btn-outline px-3 py-2 text-xs"><Wallet size={14} /> View All Payments</button>
                <button onClick={() => onNav("settlements")} className="btn-outline px-3 py-2 text-xs"><Banknote size={14} /> View Settlements</button>
                <button onClick={() => onNav("transactions")} className="btn-outline px-3 py-2 text-xs"><Receipt size={14} /> View Transactions</button>
                <button onClick={exportCsv} className="btn-outline px-3 py-2 text-xs"><Download size={14} /> Export Report</button>
                <button onClick={() => onNav("settlements")} className="btn-primary px-3 py-2 text-xs"><Send size={14} /> Generate Settlement</button>
              </div>
            </>
          )}

      {/* Payment detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40" onClick={() => setDetail(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-ink-900">Payment details</h3>
              <button onClick={() => setDetail(null)} className="rounded-full p-1.5 text-ink-500 hover:bg-ink-900/[.05]"><X size={18} /></button>
            </div>
            {detail.loading || detailBusy ? <div className="grid h-40 place-items-center"><Spinner className="h-6 w-6" /></div>
              : !detail.id ? <Empty icon={AlertTriangle} title="Couldn't load payment" />
                : (
                  <div className="space-y-1">
                    <span className={cn("chip mb-3 inline-block", PAY_CHIP[detail.status] || PAY_CHIP.CREATED)}>{PAY_LABEL[detail.status] || detail.status}</span>
                    {[["Payment ID", detail.id], ["Razorpay Order ID", detail.razorpayOrderId || "—"], ["Razorpay Payment ID", detail.razorpayPaymentId || "—"],
                      ["Patient", detail.patient?.name || "—"], ["Doctor", detail.doctor?.name ? `Dr. ${detail.doctor.name}` : "—"],
                      ["Consultation", detail.consultationReason || "—"], ["Consultation ID", detail.consultationId || "—"],
                      ["Gross Amount", rupee(detail.grossPaise)], ["Platform Fee", rupee(detail.platformFeePaise)], ["Doctor Earnings", rupee(detail.doctorEarningPaise)],
                      ["Payment Method", fmtMethod(detail.method)],
                      ["Payment Status", detail.status], ["Created At", fmtDateTime(detail.createdAt)], ["Paid At", detail.capturedAt ? fmtDateTime(detail.capturedAt) : "—"],
                      ["Refund Status", detail.refundStatus], ["Refund Amount", rupee(detail.refundAmountPaise)]].map(([lbl, val]: any) => (
                      <div key={lbl} className="flex items-start justify-between gap-4 border-b border-ink-900/[.05] py-2 text-sm">
                        <span className="text-ink-500">{lbl}</span>
                        <span className="max-w-[60%] break-words text-right font-medium text-ink-900">{val}</span>
                      </div>
                    ))}
                    {detail.status === "CAPTURED" && (
                      <button onClick={() => openInvoice(detail.id)} className="btn-outline mt-4 w-full py-2.5 text-sm"><FileText size={14} /> View invoice <ExternalLink size={12} /></button>
                    )}
                    <p className="mt-3 text-[11px] text-ink-400">Payout is via the monthly settlement (see Settlements). Card/UPI/OTP details are never stored or shown.</p>
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Transactions — per-user consultation payment history + invoices
   ========================================================================= */
const TXN_CHIP: any = {
  CAPTURED: "bg-emerald-50 text-emerald-600",
  CREATED: "bg-ink-900/[.06] text-ink-500",
  FAILED: "bg-rose-50 text-rose-600",
  REFUND_PENDING: "bg-amber-50 text-amber-600",
  REFUNDED: "bg-sky-50 text-sky-600",
};
const fmtDateTime = (iso: any) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return String(iso); }
};

// Small avatar: initials on a tinted circle (no external image dependency).
function UserAv({ user }: any) {
  const initials = String(user?.fullName || "?").trim().split(/\s+/)
    .map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
      {initials}
    </span>
  );
}

function TransactionsSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<any>(null); // { user, summary, transactions } | { loading:true }
  const [invoiceBusy, setInvoiceBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async (search = "") => {
    setLoading(true); setLoadError("");
    try { const d = await dok.admin.txnUsers(search ? { search } : {}); setUsers(d.users || []); }
    catch (e) { setUsers([]); setLoadError(errorText(e)); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openUser = async (id: string) => {
    setMsg(""); setDetail({ loading: true });
    try { setDetail(await dok.admin.userTransactions(id)); }
    catch { setDetail(null); setMsg("Couldn't load this user's transactions."); }
  };

  const openInvoice = async (requestId: string) => {
    if (!requestId) return;
    setInvoiceBusy(requestId); setMsg("");
    try {
      const r = await dok.admin.txnInvoice(requestId);
      if (r?.url) window.open(r.url, "_blank", "noopener");
      else setMsg("Invoice not available.");
    } catch (e: any) { setMsg(e?.response?.data?.message || "Invoice not available."); }
    setInvoiceBusy("");
  };

  // ── User detail (full history) ──
  if (detail) {
    const u = detail.user, txns = detail.transactions || [], sum = detail.summary || {};
    return (
      <div className="space-y-6">
        <button onClick={() => { setDetail(null); setMsg(""); }} className="flex items-center gap-1.5 text-sm font-semibold text-ink-600 transition hover:text-ink-900">
          <ArrowLeft size={16} /> All users
        </button>

        {detail.loading ? <StatGridSkeleton count={4} /> : (
          <>
            <div className="card flex items-center gap-4 p-5">
              <UserAv user={u} />
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-extrabold text-ink-900">{u?.fullName || "—"}</p>
                <p className="text-sm text-ink-500">{u?.email || u?.phoneNumber || u?.id}</p>
              </div>
              <span className="chip ml-auto bg-brand-50 capitalize text-brand-700">{String(u?.role || "").replace("_", " ")}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Transactions" value={sum.total ?? 0} tone="brand" />
              <Stat label="Captured" value={sum.captured ?? 0} tone="emerald" />
              <Stat label="Total paid" value={rupee(sum.paidPaise)} tone="sky" />
              <Stat label="Total earned" value={rupee(sum.earnedPaise)} tone="emerald" />
            </div>

            {msg && <p className="rounded-xl bg-danger-50 px-3 py-2 text-xs font-semibold text-danger-700">{msg}</p>}

            {txns.length === 0 ? <Empty icon={Receipt} title="No transactions" /> : (
              <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-900/[.06] text-left text-xs text-ink-500">
                        <th className="px-4 py-3 font-semibold">Direction</th>
                        <th className="px-4 py-3 font-semibold">Payer → Doctor</th>
                        <th className="px-4 py-3 text-right font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Date &amp; time</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Txn ID</th>
                        <th className="px-4 py-3 text-right font-semibold">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((t: any) => (
                        <tr key={t.id} className="border-b border-ink-900/[.04] align-middle last:border-0">
                          <td className="px-4 py-3">
                            <span className={cn("chip", t.direction === "paid" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                              {t.direction === "paid" ? "Paid" : "Earned"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-ink-600">
                            <span className="font-semibold text-ink-900">{t.payerName || "—"}</span>
                            {" → "}
                            <span className="font-semibold text-ink-900">Dr. {t.doctorName || "—"}</span>
                            {t.reason && <p className="mt-0.5 max-w-[220px] truncate text-ink-400">{t.reason}</p>}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums text-ink-900">
                            {rupee(t.totalPaise)}
                            <p className="text-[10px] font-normal text-ink-400">
                              fee {rupee(t.consultationFeePaise)} + {rupee((Number(t.platformFeePaise) || 0) + (Number(t.gstPaise) || 0))}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-ink-600">{fmtDateTime(t.capturedAt || t.createdAt)}</td>
                          <td className="px-4 py-3"><span className={cn("chip", TXN_CHIP[t.status] || TXN_CHIP.CREATED)}>{t.status}</span></td>
                          <td className="px-4 py-3 font-mono text-[11px] text-ink-500">{t.razorpayPaymentId || "—"}</td>
                          <td className="px-4 py-3 text-right">
                            {t.status === "CAPTURED" ? (
                              <button disabled={invoiceBusy === t.requestId} onClick={() => openInvoice(t.requestId)} className="btn-outline px-2.5 py-1.5 text-xs">
                                {invoiceBusy === t.requestId ? <Loader2 size={13} className="animate-spin" /> : <><FileText size={13} /> Invoice <ExternalLink size={11} /></>}
                              </button>
                            ) : <span className="text-xs text-ink-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── User cards grid ──
  return (
    <div className="space-y-6">
      <SectionHead title="Transactions" subtitle="Every consultation payment, grouped by user — click a card for the full history"
        right={<button onClick={() => load(q)} className="btn-outline px-3 py-2 text-xs"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button>} />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(q); }}
          placeholder="Search by name or email…" className="input pl-9" />
      </div>

      {msg && <p className="rounded-xl bg-danger-50 px-3 py-2 text-xs font-semibold text-danger-700">{msg}</p>}
      {loading ? <RowsSkeleton count={6} />
        : loadError ? <ErrorState message={loadError} onRetry={() => load(q)} />
        : users.length === 0 ? <Empty icon={Receipt} title="No transactions yet" sub="Consultation payments will appear here." />
          : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => (
                <button key={u.id} onClick={() => openUser(u.id)} className="card press flex items-center gap-3 p-4 text-left transition hover:border-brand-300">
                  <UserAv user={u} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{u.fullName || "—"}</p>
                    <p className="truncate text-xs text-ink-400">{u.email || u.id}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="chip bg-ink-900/[.05] text-ink-600">{u.txnCount} txns</span>
                      {Number(u.paidPaise) > 0 && <span className="chip bg-sky-50 text-sky-600">paid {rupee(u.paidPaise)}</span>}
                      {Number(u.earnedPaise) > 0 && <span className="chip bg-emerald-50 text-emerald-600">earned {rupee(u.earnedPaise)}</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-300" />
                </button>
              ))}
            </div>
          )}
    </div>
  );
}

/* =========================================================================
   Settlements — doctor payouts (platform-held earnings, monthly bank transfer)
   ========================================================================= */
const SETTLEMENT_CHIP: any = {
  GENERATED:  "bg-sky-50 text-sky-600",
  PROCESSING: "bg-amber-50 text-amber-600",
  PAID:       "bg-emerald-50 text-emerald-600",
  FAILED:     "bg-rose-50 text-rose-600",
  CANCELLED:  "bg-ink-900/[.06] text-ink-500",
  PENDING:    "bg-ink-900/[.06] text-ink-500",
};
const rupee = (paise: any) => "₹" + Math.round((Number(paise) || 0) / 100).toLocaleString("en-IN");
// A money figure that could not be loaded is "—", never a misleading ₹0.
const money = (paise: any) => (paise == null ? "—" : rupee(paise));
const firstOfMonth = (offset = 0) => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1)).toISOString().slice(0, 10);
};
const SETTLE_STATUSES = ["", "GENERATED", "PROCESSING", "PAID", "FAILED", "CANCELLED"];

function SettlementsSection() {
  const [sum, setSum] = useState<any>(null);
  const [liab, setLiab] = useState<any>(null);
  const [rev, setRev] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");        // settlement id currently acting
  const [payFor, setPayFor] = useState("");    // id showing the UTR input
  const [utr, setUtr] = useState("");
  const [gen, setGen] = useState({ periodStart: firstOfMonth(-1), periodEnd: firstOfMonth(0), doctorId: "" });
  const [genBusy, setGenBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: string; text: string } | null>(null);
  const [failed, setFailed] = useState<string[]>([]);   // figures that could not be loaded
  const [listError, setListError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setListError("");
    let listErr = "";
    const [s, l, r, ls] = await Promise.all([
      dok.admin.settlementSummary().catch(() => null),
      dok.admin.settlementLiability().catch(() => null),
      dok.admin.settlementRevenue().catch(() => null),
      dok.admin.settlements(status ? { status } : {}).catch((e) => { listErr = errorText(e); return null; }),
    ]);
    const liability = s?.liability ?? l?.liability ?? null;
    setFailed([
      !s && "settlement totals",
      !liability && "amount owed to doctors",
      !r && "platform revenue",
    ].filter(Boolean) as string[]);
    setSum(s?.settlements ?? null);
    setLiab(liability);
    setRev(r?.revenue ?? null);
    setList(ls?.items ?? []);
    setListError(listErr);
    setLoading(false);
  }, [status]);
  useEffect(() => { load(); }, [load]);

  const act = async (id: string, fn: () => Promise<any>, ok: string) => {
    setBusy(id); setMsg(null);
    try { await fn(); setMsg({ tone: "emerald", text: ok }); await load(); }
    catch (e: any) { setMsg({ tone: "rose", text: e?.response?.data?.message || "Action failed" }); }
    setBusy(""); setPayFor(""); setUtr("");
  };

  const generate = async () => {
    setGenBusy(true); setMsg(null);
    try {
      const out = await dok.admin.generateSettlements({
        periodStart: gen.periodStart, periodEnd: gen.periodEnd,
        doctorId: gen.doctorId.trim() || undefined,
      });
      setMsg({ tone: "emerald", text: `Generated ${out.generated} settlement(s) — ${out.payable} payable.` });
      await load();
    } catch (e: any) { setMsg({ tone: "rose", text: e?.response?.data?.message || "Generation failed" }); }
    setGenBusy(false);
  };

  return (
    <div className="space-y-6">
      <SectionHead title="Settlements" subtitle="Platform-held doctor earnings, settled monthly by bank transfer"
        right={<button onClick={load} className="btn-outline px-3 py-2 text-xs"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button>} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Owed to doctors" value={money(liab?.pendingPaise)} tone="amber" />
        <Stat label="Outstanding (unpaid)" value={money(sum?.outstandingPaise)} tone="sky" />
        <Stat label="Paid all-time" value={money(sum?.paidPaise)} tone="emerald" />
        <Stat label="Platform revenue" value={money(rev?.platformFeePaise)} tone="brand" />
      </div>

      {failed.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Some figures could not be loaded ({failed.join(", ")}). They show as "—". <button onClick={load} className="font-semibold underline">Retry</button></span>
        </div>
      )}

      {msg && (
        <p className={cn("anim-pop rounded-xl px-3 py-2 text-xs font-semibold",
          msg.tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-danger-50 text-danger-700")}>{msg.text}</p>
      )}

      <Panel title="Generate settlements for a period">
        <div className="flex flex-wrap items-end gap-3 pt-2">
          <label className="text-xs font-bold text-ink-600">Period start
            <input type="date" value={gen.periodStart} onChange={(e) => setGen((g) => ({ ...g, periodStart: e.target.value }))} className="input mt-1 block" /></label>
          <label className="text-xs font-bold text-ink-600">Period end
            <input type="date" value={gen.periodEnd} onChange={(e) => setGen((g) => ({ ...g, periodEnd: e.target.value }))} className="input mt-1 block" /></label>
          <label className="text-xs font-bold text-ink-600">Doctor ID (optional)
            <input value={gen.doctorId} onChange={(e) => setGen((g) => ({ ...g, doctorId: e.target.value }))} placeholder="all doctors" className="input mt-1 block" /></label>
          <button onClick={generate} disabled={genBusy || !gen.periodStart || !gen.periodEnd} className="btn-primary px-4 py-2.5 text-xs">
            {genBusy ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />} Generate
          </button>
        </div>
        <p className="pt-2 text-xs text-ink-500">Idempotent per doctor + period — safe to re-run. Aggregates each doctor’s net earnings for the window.</p>
      </Panel>

      <div className="flex flex-wrap gap-2">
        {SETTLE_STATUSES.map((st) => (
          <button key={st || "all"} onClick={() => setStatus(st)}
            className={cn("chip transition", status === st ? "bg-brand-600 text-white" : "bg-surface text-ink-600 hover:bg-ink-900/[.04]")}>
            {st || "All"}
          </button>
        ))}
      </div>

      {loading && list.length === 0 ? <RowsSkeleton count={6} />
        : listError ? <ErrorState message={listError} onRetry={load} />
        : list.length === 0 ? <Empty icon={Banknote} title="No settlements" sub="Generate a period above to create payouts." />
          : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-900/[.06] text-left text-xs text-ink-500">
                      <th className="px-4 py-3 font-semibold">Doctor</th>
                      <th className="px-4 py-3 font-semibold">Period</th>
                      <th className="px-4 py-3 text-right font-semibold">Gross</th>
                      <th className="px-4 py-3 text-right font-semibold">Fee</th>
                      <th className="px-4 py-3 text-right font-semibold">Net</th>
                      <th className="px-4 py-3 text-center font-semibold">Consults</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s) => (
                      <tr key={s.id} className="border-b border-ink-900/[.04] align-middle last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink-900">{s.doctorName || "—"}</p>
                          <p className="text-xs text-ink-400">{s.doctorEmail || s.doctorId}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-600">{s.periodStart} → {s.periodEnd}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{rupee(s.grossPaise)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink-500">{rupee(s.platformFeePaise)}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums text-ink-900">{rupee(s.netPaise)}</td>
                        <td className="px-4 py-3 text-center">{s.consultationCount}</td>
                        <td className="px-4 py-3">
                          <span className={cn("chip", SETTLEMENT_CHIP[s.status] || SETTLEMENT_CHIP.PENDING)}>{s.status}</span>
                          {s.bankReference && <p className="mt-1 text-[10px] text-ink-400">UTR {s.bankReference}</p>}
                          {s.failureReason && <p className="mt-1 text-[10px] text-rose-500">{s.failureReason}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status === "GENERATED" && (
                              <button disabled={busy === s.id} onClick={() => act(s.id, () => dok.admin.approveSettlement(s.id), "Approved")} className="btn-outline px-2.5 py-1.5 text-xs"><CheckCircle2 size={13} /> Approve</button>
                            )}
                            {["GENERATED", "PROCESSING", "FAILED"].includes(s.status) && payFor !== s.id && (
                              <button disabled={busy === s.id} onClick={() => { setPayFor(s.id); setUtr(""); }} className="btn-primary px-2.5 py-1.5 text-xs"><Send size={13} /> Mark paid</button>
                            )}
                            {payFor === s.id && (
                              <div className="flex items-center gap-1">
                                <input autoFocus value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="Bank UTR / ref" className="input h-8 w-32 text-xs" />
                                <button disabled={busy === s.id || !utr.trim()} onClick={() => act(s.id, () => dok.admin.markSettlementPaid(s.id, utr.trim()), "Marked paid")} className="btn-primary px-2.5 py-1.5 text-xs">
                                  {busy === s.id ? <Loader2 size={13} className="animate-spin" /> : "Confirm"}
                                </button>
                                <button onClick={() => setPayFor("")} className="btn-outline px-2 py-1.5 text-xs"><X size={13} /></button>
                              </div>
                            )}
                            {s.status === "FAILED" && (
                              <button disabled={busy === s.id} onClick={() => act(s.id, () => dok.admin.retrySettlement(s.id), "Retrying")} className="btn-outline px-2.5 py-1.5 text-xs"><RotateCcw size={13} /> Retry</button>
                            )}
                            {["GENERATED", "PROCESSING", "FAILED"].includes(s.status) && (
                              <button disabled={busy === s.id} title="Cancel" onClick={() => act(s.id, () => dok.admin.cancelSettlement(s.id), "Cancelled")} className="btn-outline px-2 py-1.5 text-xs text-rose-500"><XCircle size={13} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
    </div>
  );
}

/* =========================================================================
   Users
   ========================================================================= */
const ROLE_FILTERS = ["", "doctor", "student", "general_user"];
const STATUS_FILTERS = ["", "active", "suspended", "deactivated", "pending_deletion", "frozen"];

// A frozen account's login identifiers are rewritten to archived_<original>_<epoch>
// (so the person can sign up again); show the original to the admin.
const plainIdent = (v: any) => (typeof v === "string" && v.startsWith("archived_") ? v.replace(/^archived_/, "").replace(/_\d+$/, "") : v);

const BLOCKER_TEXT: Record<string, (d: any) => string> = {
  WALLET_BALANCE: (d) => `the doctor is still owed ${rupee((Number(d?.pendingPaise) || 0) + (Number(d?.availablePaise) || 0))}`,
  OPEN_SETTLEMENTS: (d) => `${d?.count} settlement(s) are not finished`,
  PENDING_REFUNDS: (d) => `${d?.count} refund(s) are pending`,
  ACTIVE_CONSULTATIONS: (d) => `${d?.count} consultation(s) are in progress`,
};

// Turn an action's error into words the admin can act on.
const actionError = (e: any) => {
  const body = e?.response?.data;
  const data = body?.data;
  if (data?.code === "PURGE_BLOCKED" && Array.isArray(data.blockers)) {
    return `Can't erase yet: ${data.blockers.map((b: any) => BLOCKER_TEXT[b.code]?.(b.detail) || b.code).join("; ")}.`;
  }
  if (data?.legs) return `${body.message} (posts & Pulses: ${data.legs.media}, messages: ${data.legs.chat}).`;
  return body?.message || errorText(e);
};

function UsersSection() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<any>(null);

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { limit: 20 };
      if (q.trim()) params.q = q.trim();
      if (role) params.role = role;
      if (status) params.status = status;
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.users(params);
      if (!isCurrent()) return;
      setRows((prev) => (reset ? d.users : [...prev, ...d.users]));
      setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [q, role, status, cursor, begin]);

  // reload whenever filters change (debounced on q)
  useEffect(() => { const t = setTimeout(() => load(true), 250); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [q, role, status]);

  return (
    <div>
      <SectionHead title="Users" subtitle="Search, suspend, deactivate, or permanently erase accounts." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, username, phone…" className="input pl-9" />
        </div>
        <Select value={role} onChange={setRole} options={ROLE_FILTERS} labels={{ "": "All roles", doctor: "Doctors", student: "Students", general_user: "General" }} />
        <Select value={status} onChange={setStatus} options={STATUS_FILTERS} labels={{ "": "All status", active: "Active", suspended: "Suspended", deactivated: "Deactivated", pending_deletion: "Pending deletion", frozen: "Archived" }} />
      </div>

      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? (
            <RowsSkeleton count={4} />
          ) : rows.length === 0 ? (
            <Empty icon={Users2} title="No users found" sub="Try a different search or filter." />
          ) : rows.map((u) => (
            <button key={u.id} onClick={() => setSel(u)} className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-ink-900/[.02]">
              <div className="relative">
                <Avatar user={u} size={42} />
                {u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-emerald-500" title="Online" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{u.fullName || "—"} {u.isVerified && <BadgeCheck size={13} className="inline text-brand-500" />}</p>
                <p className="truncate text-xs text-ink-500">{plainIdent(u.email || u.phoneNumber) || u.uniqueUsername || u.id}</p>
              </div>
              <span className="hidden text-xs capitalize text-ink-500 sm:block">{u.role?.replace("_", " ")}</span>
              <span className={cn("chip text-[10px]", STATUS_CHIP[u.accountStatus] || "bg-ink-900/[.06] text-ink-600")}>{STATUS_LABEL[u.accountStatus] || u.accountStatus}</span>
              <ChevronRight size={18} className="text-ink-300" />
            </button>
          ))}
        </div>
      )}

      {error && rows.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}

      <div className="mt-6"><AccountRulesCard /></div>

      {sel && <UserDrawer userRow={sel} onClose={() => setSel(null)} onChanged={() => { setSel(null); load(true); }} />}
    </div>
  );
}

function Select({ value, onChange, options, labels }: any) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input w-auto appearance-none py-2 text-sm">
      {options.map((o: string) => <option key={o} value={o}>{labels[o] ?? o}</option>)}
    </select>
  );
}

const SUSPEND_PRESETS: [string, string][] = [["1", "1 day"], ["3", "3 days"], ["7", "7 days"], ["30", "30 days"], ["custom", "Custom"], ["permanent", "Permanent"]];
const REASON_MIN = 5;
const REASON_MAX = 500;

// After a suspension or deactivation: a sign-out that could not reach every
// device (Redis down, say) or patients still waiting on this doctor.
const signOutNotice = (d: any) => {
  const t = d?.terminated;
  const partial = t && ["sessions", "refreshTokens", "accessTokens"].some((k) => t[k] === false);
  const waiting = Number(d?.warnings?.activeConsultationsAsDoctor) || 0;
  return [
    partial ? "Done, but not every device could be signed out right now. Their access ends when their current sign-in expires (about 15 minutes)." : "",
    waiting ? `They still have ${waiting} consultation${waiting === 1 ? "" : "s"} in progress. Those are not cancelled automatically.` : "",
  ].filter(Boolean).join(" ");
};

function UserDrawer({ userRow, onClose, onChanged }: any) {
  const [detail, setDetail] = useState<any>(null);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState<null | "suspend" | "delete">(null);
  const [reason, setReason] = useState("");
  const [preset, setPreset] = useState("7");
  const [customDays, setCustomDays] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState("");

  const loadDetail = useCallback(() => {
    setLoadError("");
    dok.admin.user(userRow.id).then(setDetail).catch((e) => setLoadError(errorText(e)));
  }, [userRow.id]);
  useEffect(() => { loadDetail(); }, [loadDetail]);

  // `noticeFor` turns a successful response into something the admin must read
  // before the drawer closes; nothing to say → close straight away.
  const act = async (fn: () => Promise<any>, noticeFor?: (d: any) => string) => {
    setBusy(true); setMsg("");
    try {
      const d = await fn();
      const note = noticeFor ? noticeFor(d) : "";
      if (!note) return onChanged();
      setNotice(note); setMode(null); setBusy(false); loadDetail();
    } catch (e: any) { setMsg(actionError(e)); setBusy(false); }
  };

  const u = detail?.user || userRow;
  const s = detail?.stats;
  const trimmed = reason.trim();
  const reasonOk = trimmed.length >= REASON_MIN && trimmed.length <= REASON_MAX;
  const days = preset === "custom" ? Number(customDays) : Number(preset);
  const durationOk = preset === "permanent" || (Number.isInteger(days) && days >= 1 && days <= 365);
  const waitingPatients = s?.consultations?.activeAsDoctor || 0;
  const canSuspend = ["ACTIVE", "DEACTIVATED", "SUSPENDED"].includes(u.accountStatus);

  const suspend = () => act(() => dok.admin.suspendUser(u.id, preset === "permanent"
    ? { reason: trimmed, permanent: true }
    : { reason: trimmed, durationDays: days }), signOutNotice);

  return (
    <Drawer onClose={onClose} title="User details">
      <div className="flex items-center gap-3">
        <div className="relative"><Avatar user={u} size={56} />{u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-emerald-500" />}</div>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink-900">{u.fullName || "—"} {u.isVerified && <BadgeCheck size={14} className="inline text-brand-500" />}</p>
          <p className="truncate text-xs text-ink-500">{plainIdent(u.email || u.phoneNumber) || "—"} · @{u.uniqueUsername || "—"}</p>
          <span className={cn("chip mt-1.5 text-[10px]", STATUS_CHIP[u.accountStatus] || "bg-ink-900/[.06] text-ink-600")}>{STATUS_LABEL[u.accountStatus] || u.accountStatus}</span>
        </div>
      </div>

      {u.accountStatus === "SUSPENDED" && (
        <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">
          {u.suspendedUntil ? `Suspended until ${new Date(u.suspendedUntil).toLocaleString()}` : "Suspended permanently"}
          {u.suspensionReason ? ` · Reason: ${u.suspensionReason}` : ""}
        </div>
      )}
      {u.accountStatus === "PENDING_DELETION" && (
        <div className="mt-3 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-700">
          Deletion requested {formatDate(u.deletionRequestedAt)} · recovery ends {formatDate(u.scheduledDeletionAt)}
          {daysUntil(u.scheduledDeletionAt) != null ? ` (in ${daysUntil(u.scheduledDeletionAt)} days)` : ""}. Logging in before then restores the account.
        </div>
      )}
      {u.accountStatus === "FROZEN" && (
        <div className="mt-3 rounded-xl bg-sky-50 p-2.5 text-xs text-sky-700">
          Archived {formatDate(u.frozenAt)}: the recovery period ended. Data is kept; the user can no longer restore it.
        </div>
      )}

      {loadError && <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">Couldn't load details: {loadError} <button onClick={loadDetail} className="underline">Retry</button></div>}

      {s && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[["Posts", s.content?.posts], ["Research", s.content?.research], ["Case studies", s.content?.caseStudies], ["Pulses", s.content?.pulses],
            ["As patient", s.consultations?.asPatient], ["As doctor", s.consultations?.asDoctor], ["Reports", s.pendingReportsAgainst]].map(([l, v]) => (
            <div key={l as string} className="rounded-xl bg-ink-900/[.03] p-2">
              {/* null = that service is unreachable: "—", not a misleading 0 */}
              <p className="text-lg font-extrabold text-ink-900">{formatStat(v)}</p>
              <p className="text-[10px] text-ink-500">{l}</p>
            </div>
          ))}
        </div>
      )}

      <ReviewHistory history={detail?.recentActions} />

      <div className="mt-3 space-y-1 text-xs text-ink-500">
        <p>Role: <span className="capitalize text-ink-700">{u.role?.replace("_", " ")}</span></p>
        <p>Joined: {formatDate(u.createdAt)}</p>
        {u.lastActiveAt && <p>Last active: {timeAgo(u.lastActiveAt)}</p>}
        <p className="break-all">ID: {u.id}</p>
      </div>

      {msg && <div className="mt-4 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">{msg}</div>}
      {notice && (
        <div role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p>{notice}</p>
          <button onClick={() => onChanged()} className="btn-outline mt-2 px-3 py-1.5 text-xs">Done</button>
        </div>
      )}

      {/* Action forms */}
      {mode === "suspend" && (
        <div className="mt-4 space-y-2 rounded-xl border border-rose-200 bg-rose-50/50 p-3">
          <p className="text-sm font-bold text-rose-700">Suspend account</p>
          <p className="text-xs text-rose-600">They are signed out everywhere at once and can't sign in. Their posts and Pulses are hidden. They will see the reason below.</p>
          <div className="flex flex-wrap gap-1.5">
            {SUSPEND_PRESETS.map(([k, l]) => (
              <button key={k} onClick={() => setPreset(k)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", preset === k ? "bg-rose-600 text-white" : "bg-surface text-ink-600")}>{l}</button>
            ))}
          </div>
          {preset === "custom" && <input value={customDays} onChange={(e) => setCustomDays(e.target.value)} placeholder="Number of days (1-365)" inputMode="numeric" className="input text-sm" />}
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={REASON_MAX} placeholder="Reason (the user will see this)…" className="input resize-none text-sm" />
          <p className="text-right text-[10px] text-ink-400">{trimmed.length}/{REASON_MAX}{trimmed.length > 0 && trimmed.length < REASON_MIN ? ` · at least ${REASON_MIN}` : ""}</p>
          {waitingPatients > 0 && (
            <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700"><AlertTriangle size={12} className="mr-1 inline" />This doctor has {waitingPatients} consultation(s) waiting. Those patients won't be able to reach them.</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setMode(null)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
            <button disabled={busy || !reasonOk || !durationOk} onClick={suspend} className="btn flex-1 bg-rose-600 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-40">
              {busy ? "…" : preset === "permanent" ? "Suspend permanently" : `Suspend for ${preset === "custom" ? (customDays || "?") : preset} day(s)`}
            </button>
          </div>
        </div>
      )}
      {mode === "delete" && (
        <div className="mt-4 space-y-2 rounded-xl border border-rose-300 bg-rose-50 p-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-rose-700"><AlertTriangle size={15} /> Erase permanently</p>
          <p className="text-xs text-rose-600">This removes the account, its posts, Pulses, messages and files from every service. It cannot be undone. Payment records and the audit log are kept. Type <b>DELETE</b> to confirm.</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={REASON_MAX} placeholder="Reason (recorded in the audit log)…" className="input resize-none text-sm" />
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type DELETE" className="input text-sm" />
          <div className="flex gap-2">
            <button onClick={() => setMode(null)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
            <button disabled={busy || confirmText !== "DELETE" || !reasonOk} onClick={() => act(() => dok.admin.deleteUser(u.id, { confirm: true, reason: trimmed }))} className="btn flex-1 bg-rose-700 py-2 text-sm text-white hover:bg-rose-800 disabled:opacity-40">{busy ? "Erasing…" : "Erase forever"}</button>
          </div>
        </div>
      )}

      {!mode && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {u.accountStatus === "SUSPENDED" && (
            <button disabled={busy} onClick={() => act(() => dok.admin.unsuspendUser(u.id))} className="btn-primary col-span-2 py-2.5 text-sm"><RotateCcw size={16} /> Lift suspension</button>
          )}
          {canSuspend && u.accountStatus !== "SUSPENDED" && (
            <button onClick={() => { setReason(""); setPreset("7"); setCustomDays(""); setMsg(""); setMode("suspend"); }} className="btn col-span-2 bg-rose-50 py-2.5 text-sm text-rose-600 hover:bg-rose-100"><Ban size={16} /> Suspend</button>
          )}
          {u.accountStatus === "SUSPENDED" && (
            <button onClick={() => { setReason(u.suspensionReason || ""); setPreset("7"); setCustomDays(""); setMsg(""); setMode("suspend"); }} className="btn-outline col-span-2 py-2.5 text-sm"><Clock size={16} /> Change suspension</button>
          )}
          {u.accountStatus === "ACTIVE" && (
            <button disabled={busy} onClick={() => act(() => dok.admin.deactivateUser(u.id, {}), signOutNotice)} className="btn-outline col-span-2 py-2.5 text-sm" title="Hides the account and signs it out. The user can undo this by logging in.">
              <UserX size={16} /> Deactivate (user can undo by logging in)
            </button>
          )}
          {!canSuspend && (
            <p className="col-span-2 rounded-lg bg-ink-900/[.03] p-2 text-xs text-ink-500">
              {u.accountStatus === "FROZEN" ? "An archived account can't be suspended or deactivated." : "This account is scheduled for deletion, so it can't be suspended. Erase it, or wait for the user."}
            </p>
          )}
          <button onClick={() => { setReason(""); setConfirmText(""); setMsg(""); setMode("delete"); }} className="btn col-span-2 border border-rose-300 bg-surface py-2.5 text-sm text-rose-700 hover:bg-rose-50"><Trash2 size={16} /> Erase permanently</button>
        </div>
      )}
    </Drawer>
  );
}

/* =========================================================================
   Content
   ========================================================================= */
const CONTENT_TABS = [
  { key: "post", label: "Posts", icon: FileText },
  { key: "research", label: "Research", icon: BookOpen },
  { key: "case_study", label: "Case studies", icon: BookOpen },
  { key: "pulse", label: "Pulses", icon: Film },
];

function ContentSection() {
  const [type, setType] = useState("post");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { type, limit: 20 };
      if (q.trim().length >= 2) params.q = q.trim();
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.content(params);
      if (!isCurrent()) return;
      setItems((prev) => (reset ? d.items : [...prev, ...d.items]));
      setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setItems([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [type, q, cursor, begin]);
  useEffect(() => { const t = setTimeout(() => load(true), 250); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [type, q]);

  const del = async (it: any) => {
    if (!confirm(`Remove this ${type.replace("_", " ")}? It disappears from the app and its open reports are closed.`)) return;
    setMsg("");
    try {
      await dok.admin.deleteContent(type, it.id, {});
      setItems((prev) => prev.filter((x) => x.id !== it.id));
    } catch (e: any) { setMsg(actionError(e)); }
  };

  return (
    <div>
      <SectionHead title="Content" subtitle="Remove any post, research summary, case study, or Pulse." />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {CONTENT_TABS.map((t) => (
          <button key={t.key} onClick={() => setType(t.key)} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition", type === t.key ? "bg-brand-600 text-white shadow-glow" : "bg-surface text-ink-600 hover:bg-brand-50")}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      <div className="relative mb-4">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content (2+ characters)…" className="input pl-9" />
      </div>

      {msg && <div className="mb-3 rounded-xl bg-rose-50 p-2.5 text-sm text-rose-700">{msg}</div>}

      {error && items.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && items.length === 0 ? <RowsSkeleton count={4} />
            : items.length === 0 ? <Empty icon={FileStack} title="No content" sub="Nothing matches here." />
            : items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 p-3.5">
                <Avatar user={it.author} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{it.title || it.text || <span className="italic text-ink-400">(media only)</span>}</p>
                  <p className="truncate text-xs text-ink-500">
                    {it.author?.fullName || "[deleted user]"} · {compact(it.likesCount || 0)} likes · {compact(it.commentsCount || 0)} comments · {timeAgo(it.createdAt)}
                    {it.pendingReports > 0 && <span className="ml-1 text-rose-500">· {it.pendingReports} open report(s)</span>}
                    {it.isDeleted && <span className="ml-1 text-rose-500">· removed</span>}
                  </p>
                </div>
                {!it.isDeleted && <button onClick={() => del(it)} className="press rounded-lg bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" title="Remove"><Trash2 size={16} /></button>}
              </div>
            ))}
        </div>
      )}
      {error && items.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}
    </div>
  );
}

/* =========================================================================
   Verifications (doctor + student)
   ========================================================================= */
const KYC_TABS = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"];
const STUDENT_TABS = ["SUBMITTED", "APPROVED", "REJECTED"];
const KYC_CHIP: any = { SUBMITTED: "bg-amber-50 text-amber-600", IN_REVIEW: "bg-sky-50 text-sky-600", APPROVED: "bg-emerald-50 text-emerald-600", REJECTED: "bg-rose-50 text-rose-600", NOT_SUBMITTED: "bg-ink-900/[.06] text-ink-600" };
const ID_TYPE_LABEL: any = { AADHAAR: "Aadhaar card", PAN: "PAN card" };
const HISTORY_LABEL: any = {
  "verification.view": "Documents viewed", "verification.in_review": "Marked in review", "verification.approve": "Approved",
  "verification.reject": "Rejected", "verification.reset": "Reset",
  "user.suspend": "Suspended", "user.unsuspend": "Suspension lifted", "user.unsuspend.expired": "Suspension ended",
  "user.deactivate": "Deactivated", "user.delete.failed": "Erase failed",
};

function VerificationsSection() {
  const [kind, setKind] = useState<"doctor" | "student">("doctor");
  return (
    <div>
      <SectionHead title="Verifications" subtitle="Review health-professional and student verification submissions." />
      <div className="mb-4 flex gap-2">
        <button onClick={() => setKind("doctor")} className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold", kind === "doctor" ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}><Stethoscope size={15} /> Doctors</button>
        <button onClick={() => setKind("student")} className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold", kind === "student" ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}><GraduationCap size={15} /> Students</button>
      </div>
      {kind === "doctor" ? <DoctorVerifications /> : <StudentVerifications />}
    </div>
  );
}

// One document: images inline, PDFs as a link. Links are signed for 5 minutes
// and never stored; referrers are stripped so the link can't leak onward.
function DocumentTile({ doc }: { doc: any }) {
  if (!doc.url) {
    return (
      <div className="rounded-xl border border-dashed border-ink-900/[.15] p-3 text-xs text-ink-500">
        <p className="font-semibold text-ink-700">{doc.label}</p>
        {doc.status === "unavailable" ? "Couldn't be loaded right now — use Refresh." : "Stored outside this applicant's folder, so it isn't shown."}
      </div>
    );
  }
  const isImage = String(doc.contentType || "").startsWith("image/");
  return (
    <a href={doc.url} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer" className="block overflow-hidden rounded-xl border border-ink-900/[.08] transition hover:border-brand-400">
      {isImage
        ? <img src={doc.url} alt={doc.label} referrerPolicy="no-referrer" loading="lazy" className="h-40 w-full bg-ink-900/[.03] object-contain" />
        : <div className="grid h-40 place-items-center bg-ink-900/[.03] text-sm font-semibold text-brand-600"><span className="flex items-center gap-1.5"><FileText size={20} /> Open document</span></div>}
      <p className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-ink-700">{doc.label} <ExternalLink size={12} className="text-ink-400" /></p>
    </a>
  );
}

function VerificationDocuments({ docs, onRefresh, loading }: { docs: any[]; onRefresh: () => void; loading: boolean }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Documents</p>
        <button onClick={onRefresh} className="flex items-center gap-1 text-xs font-semibold text-brand-600"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh</button>
      </div>
      {docs.length === 0
        ? <p className="rounded-xl bg-ink-900/[.03] p-3 text-xs text-ink-500">No documents were submitted.</p>
        : <div className="grid grid-cols-2 gap-2">{docs.map((d) => <DocumentTile key={d.kind} doc={d} />)}</div>}
      <p className="mt-1.5 text-[10px] text-ink-400">Links expire 5 minutes after loading. Every view is recorded in the audit log.</p>
    </div>
  );
}

function ReviewHistory({ history }: { history: any[] }) {
  if (!history?.length) return null;
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">History</p>
      <div className="space-y-1 text-xs text-ink-500">
        {history.map((h, i) => (
          <p key={i}>{HISTORY_LABEL[h.action] || h.action} · {h.adminUsername || "system"} · {timeAgo(h.createdAt)}{h.metadata?.reason ? ` · "${h.metadata.reason}"` : ""}</p>
        ))}
      </div>
    </div>
  );
}

function RejectBox({ reason, setReason, onCancel, onConfirm, busy }: any) {
  const t = reason.trim();
  const ok = t.length >= REASON_MIN && t.length <= REASON_MAX;
  return (
    <div className="mt-4 space-y-2">
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={REASON_MAX} placeholder="Reason for rejection (shown to the applicant)…" className="input resize-none text-sm" />
      <p className="text-right text-[10px] text-ink-400">{t.length}/{REASON_MAX}{t.length > 0 && t.length < REASON_MIN ? ` · at least ${REASON_MIN}` : ""}</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
        <button disabled={!ok || busy} onClick={onConfirm} className="btn flex-1 bg-rose-600 py-2.5 text-sm text-white hover:bg-rose-700 disabled:opacity-40">Confirm rejection</button>
      </div>
    </div>
  );
}

function DoctorVerifications() {
  const [tab, setTab] = useState("SUBMITTED");
  const [stats, setStats] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<any>(null);

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    if (reset) dok.admin.vStats().then(setStats).catch(() => {});
    try {
      const d = await dok.admin.vList(tab, reset ? null : cursor);
      if (!isCurrent()) return;
      setRows((prev) => (reset ? d.verifications : [...prev, ...d.verifications]));
      setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [tab, cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [tab]);

  return (
    <>
      {stats && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Submitted" value={stats.submitted} tone="amber" />
          <Stat label="In review" value={stats.inReview} tone="sky" />
          <Stat label="Approved" value={stats.approved} tone="emerald" />
          <Stat label="Rejected" value={stats.rejected} tone="rose" />
        </div>
      )}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {KYC_TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold capitalize", tab === t ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}>{t.replace("_", " ").toLowerCase()}</button>)}
      </div>
      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty title="Queue is clear" sub={`No ${tab.replace("_", " ").toLowerCase()} submissions.`} />
            : rows.map((v) => (
              <button key={v.userId} onClick={() => setSel(v)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-ink-900/[.02]">
                <Avatar user={v.user} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{v.user?.fullName || "—"}</p>
                  <p className="truncate text-xs text-ink-500">
                    {[v.professionType, v.registrationNumber && `Reg. ${v.registrationNumber}`, v.countryOfPractice].filter(Boolean).join(" · ") || "No submission details"}
                    {v.submittedAt ? ` · submitted ${timeAgo(v.submittedAt)}` : ""}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-400">
                    {[v.hasIdFront && "ID front", v.hasIdBack && "ID back", v.hasLiveness && "selfie", v.hasLicenseDoc && "licence"].filter(Boolean).join(" · ") || "no documents"}
                  </p>
                </div>
                <span className={cn("chip text-[10px]", KYC_CHIP[v.kycStatus])}>{v.kycStatus?.replace("_", " ").toLowerCase()}</span>
                <ChevronRight size={18} className="text-ink-300" />
              </button>
            ))}
        </div>
      )}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}

      {sel && <DoctorReviewDrawer row={sel} onClose={() => setSel(null)} onChanged={() => { setSel(null); load(true); }} />}
    </>
  );
}

function DoctorReviewDrawer({ row, onClose, onChanged }: any) {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setD(await dok.admin.vDetail(row.userId)); } catch (e) { setError(errorText(e)); }
    setLoading(false);
  }, [row.userId]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>) => {
    setBusy(true); setMsg("");
    try { await fn(); onChanged(); } catch (e: any) { setMsg(actionError(e)); setBusy(false); }
  };

  const status = d?.profile?.kycStatus || row.kycStatus;
  const sub = d?.submission;
  const user = d?.profile?.user || row.user;

  return (
    <Drawer onClose={onClose} title="Review verification">
      <div className="flex items-center gap-3">
        <Avatar user={user} size={52} />
        <div className="min-w-0">
          <p className="font-bold text-ink-900">{user?.fullName}</p>
          <p className="truncate text-xs text-ink-500">{[user?.email, user?.phoneNumber].filter(Boolean).join(" · ")}</p>
          <span className={cn("chip mt-1 text-[10px]", KYC_CHIP[status])}>{String(status || "").replace("_", " ").toLowerCase()}</span>
        </div>
      </div>

      {error ? <div className="mt-4"><ErrorState message={error} onRetry={load} /></div> : (
        <>
          <div className="mt-4 space-y-2 text-sm">
            <Detail label="Profession" value={sub?.professionType} />
            <Detail label="Registration #" value={sub?.registrationNumber} />
            <Detail label="Qualification" value={sub?.highestQualification} />
            <Detail label="Country / state" value={[sub?.countryOfPractice, sub?.stateRegion].filter(Boolean).join(" · ")} />
            <Detail label="Contact number" value={sub?.contactNumber} />
            <Detail label="ID type" value={ID_TYPE_LABEL[sub?.idType] || (sub ? "Not stated" : "")} />
            <Detail label="Live selfie check" value={sub ? (sub.livenessPassed ? "Passed" : "Not passed") : ""} />
            <Detail label="Submitted" value={sub?.submittedAt ? `${formatDate(sub.submittedAt)} (${timeAgo(sub.submittedAt)})` : ""} />
          </div>
          {d?.profile?.kycRejectionReason && <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">Last rejection: {d.profile.kycRejectionReason}</div>}
          {loading && !d ? <div className="mt-4"><RowsSkeleton count={2} /></div> : <VerificationDocuments docs={d?.documents || []} onRefresh={load} loading={loading} />}
          <ReviewHistory history={d?.history} />
        </>
      )}

      {msg && <div className="mt-4 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">{msg}</div>}

      {rejecting ? (
        <RejectBox reason={reason} setReason={setReason} busy={busy} onCancel={() => setRejecting(false)}
          onConfirm={() => act(() => dok.admin.vReject(row.userId, reason.trim()))} />
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {status === "SUBMITTED" && <button disabled={busy} onClick={() => act(() => dok.admin.vInReview(row.userId))} className="btn-outline col-span-2 py-2.5 text-sm"><Eye size={16} /> Mark in review</button>}
          {(status === "SUBMITTED" || status === "IN_REVIEW") && <button disabled={busy} onClick={() => act(() => dok.admin.vApprove(row.userId))} className="btn-primary py-2.5 text-sm"><CheckCircle2 size={16} /> Approve</button>}
          {(status === "SUBMITTED" || status === "IN_REVIEW" || status === "APPROVED") && (
            <button disabled={busy} onClick={() => { setReason(""); setRejecting(true); }} className={cn("btn bg-rose-50 py-2.5 text-sm text-rose-600 hover:bg-rose-100", status === "APPROVED" && "col-span-2")}>
              <XCircle size={16} /> {status === "APPROVED" || user?.isVerified ? "Reject (removes the verified badge)" : "Reject"}
            </button>
          )}
          <button disabled={busy} onClick={() => { if (confirm("Reset this verification? The doctor will need to submit again.")) act(() => dok.admin.vReset(row.userId)); }} className="btn-outline col-span-2 py-2.5 text-sm"><RotateCcw size={16} /> Reset</button>
        </div>
      )}
    </Drawer>
  );
}

function StudentVerifications() {
  const [tab, setTab] = useState("SUBMITTED");
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<any>(null);

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const d = await dok.admin.svList(tab, reset ? null : cursor);
      if (!isCurrent()) return;
      setRows((prev) => (reset ? d.profiles : [...prev, ...d.profiles]));
      setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [tab, cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [tab]);

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STUDENT_TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold capitalize", tab === t ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}>{t.toLowerCase()}</button>)}
      </div>
      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty title="Queue is clear" sub={`No ${tab.toLowerCase()} student submissions.`} />
            : rows.map((v) => (
              <button key={v.userId} onClick={() => setSel(v)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-ink-900/[.02]">
                <Avatar user={v.user} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{v.user?.fullName || "—"}</p>
                  <p className="truncate text-xs text-ink-500">{v.user?.email || v.user?.phoneNumber || "—"} · {v.hasDocument ? "student ID attached" : "no document"}</p>
                </div>
                <span className={cn("chip text-[10px]", KYC_CHIP[v.verificationStatus])}>{v.verificationStatus?.toLowerCase()}</span>
                <ChevronRight size={18} className="text-ink-300" />
              </button>
            ))}
        </div>
      )}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}

      {sel && <StudentReviewDrawer row={sel} onClose={() => setSel(null)} onChanged={() => { setSel(null); load(true); }} />}
    </>
  );
}

function StudentReviewDrawer({ row, onClose, onChanged }: any) {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setD(await dok.admin.svDetail(row.userId)); } catch (e) { setError(errorText(e)); }
    setLoading(false);
  }, [row.userId]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>) => {
    setBusy(true); setMsg("");
    try { await fn(); onChanged(); } catch (e: any) { setMsg(actionError(e)); setBusy(false); }
  };
  const status = d?.profile?.verificationStatus || row.verificationStatus;
  const user = d?.profile?.user || row.user;

  return (
    <Drawer onClose={onClose} title="Student verification">
      <div className="flex items-center gap-3">
        <Avatar user={user} size={52} />
        <div><p className="font-bold text-ink-900">{user?.fullName}</p><p className="text-xs text-ink-500">{user?.email || user?.phoneNumber}</p></div>
      </div>
      {error ? <div className="mt-4"><ErrorState message={error} onRetry={load} /></div> : (
        <>
          {d?.profile?.verificationRejectionReason && <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">Last rejection: {d.profile.verificationRejectionReason}</div>}
          {loading && !d ? <div className="mt-4"><RowsSkeleton count={2} /></div> : <VerificationDocuments docs={d?.documents || []} onRefresh={load} loading={loading} />}
          <ReviewHistory history={d?.history} />
        </>
      )}
      {msg && <div className="mt-4 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">{msg}</div>}
      {rejecting ? (
        <RejectBox reason={reason} setReason={setReason} busy={busy} onCancel={() => setRejecting(false)}
          onConfirm={() => act(() => dok.admin.svReject(row.userId, reason.trim()))} />
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {status === "SUBMITTED" && <button disabled={busy} onClick={() => act(() => dok.admin.svApprove(row.userId))} className="btn-primary py-2.5 text-sm"><CheckCircle2 size={16} /> Approve</button>}
          {(status === "SUBMITTED" || status === "APPROVED") && (
            <button disabled={busy} onClick={() => { setReason(""); setRejecting(true); }} className={cn("btn bg-rose-50 py-2.5 text-sm text-rose-600 hover:bg-rose-100", status === "APPROVED" && "col-span-2")}>
              <XCircle size={16} /> {status === "APPROVED" || user?.isVerified ? "Reject (removes the verified badge)" : "Reject"}
            </button>
          )}
        </div>
      )}
    </Drawer>
  );
}

function Detail({ label, value }: any) {
  return <div className="flex items-center justify-between gap-3 border-b border-ink-900/[.05] pb-1.5"><span className="shrink-0 text-ink-500">{label}</span><span className="truncate text-right font-semibold text-ink-900">{value || "—"}</span></div>;
}

/* =========================================================================
   Reports
   ========================================================================= */
const REPORT_KINDS = [
  { key: "post", label: "Posts", icon: FileText },
  { key: "pulse", label: "Pulses", icon: Film },
  { key: "user", label: "Profiles", icon: UserRound },
];
const REPORT_STATUSES = [["pending", "Open"], ["actioned", "Actioned"], ["dismissed", "Dismissed"], ["all", "All"]];
const REPORT_STATUS_CHIP: any = { pending: "bg-amber-50 text-amber-600", actioned: "bg-emerald-50 text-emerald-600", dismissed: "bg-ink-900/[.06] text-ink-600" };

function ReportsSection() {
  const [kind, setKind] = useState("post");
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [person, setPerson] = useState<any>(null);

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { kind, status };
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.reports(params);
      if (!isCurrent()) return;
      setRows((prev) => (reset ? (d.reports || []) : [...prev, ...(d.reports || [])]));
      setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [kind, status, cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [kind, status]);

  // Optimistic in the open queue; put the card back if the server refuses.
  const resolve = async (r: any, fn: () => Promise<any>) => {
    setMsg("");
    const at = Math.max(0, rows.findIndex((y) => y.id === r.id));
    if (status === "pending") setRows((x) => x.filter((y) => y.id !== r.id));
    try { await fn(); if (status !== "pending") load(true); }
    catch (e: any) {
      // Put back just this card — a snapshot would also undo other cards
      // resolved meanwhile.
      if (status === "pending") setRows((x) => (x.some((y) => y.id === r.id) ? x : [...x.slice(0, at), r, ...x.slice(at)]));
      setMsg(actionError(e));
    }
  };
  const dismiss = (r: any) => resolve(r, () => dok.admin.dismissReport(r.id, r.kind));
  const takedown = (r: any) => {
    if (!confirm(`Remove this ${r.kind === "pulse" ? "Pulse" : "post"}? It disappears from the app and every open report on it is closed.`)) return;
    resolve(r, () => dok.admin.takedownReport(r.id, r.kind));
  };

  return (
    <div>
      <SectionHead title="Reports" subtitle="What users reported: posts, Pulses and profiles." />
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {REPORT_KINDS.map((t) => (
          <button key={t.key} onClick={() => setKind(t.key)} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition", kind === t.key ? "bg-brand-600 text-white shadow-glow" : "bg-surface text-ink-600 hover:bg-brand-50")}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {REPORT_STATUSES.map(([k, l]) => <button key={k} onClick={() => setStatus(k)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold", status === k ? "bg-ink-900 text-white" : "bg-surface text-ink-600")}>{l}</button>)}
      </div>

      {msg && <div className="mb-3 rounded-xl bg-rose-50 p-2.5 text-sm text-rose-700">{msg}</div>}

      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty title={status === "pending" ? "No open reports" : "Nothing here"} sub={status === "pending" ? "The queue is clear." : ""} />
            : rows.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="chip bg-rose-50 text-rose-600">{String(r.category || "other").replace(/_/g, " ")}</span>
                  {r.status !== "pending" && <span className={cn("chip", REPORT_STATUS_CHIP[r.status])}>{r.status}</span>}
                  <span className="text-ink-400">reported by {r.reporter ? `@${r.reporter.uniqueUsername || r.reporter.fullName}` : "[deleted user]"} · {timeAgo(r.createdAt)}</span>
                </div>
                {r.reason && <p className="mt-1.5 text-xs text-ink-500">"{r.reason}"</p>}
                <div className="mt-2 flex gap-3 rounded-xl bg-ink-900/[.03] p-3">
                  {r.target?.thumbnailUrl && <img src={r.target.thumbnailUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
                  <div className="min-w-0">
                    <p className="text-xs text-ink-400">
                      {r.kind === "user" ? "Profile of " : r.kind === "pulse" ? "Pulse by " : "Post by "}
                      {r.author?.fullName || "[deleted user]"}
                      {r.kind !== "user" && ` · ${compact(r.target?.likesCount || 0)} likes`}
                      {r.target?.isDeleted && <span className="ml-1 text-rose-500">· removed</span>}
                      {r.kind === "user" && r.target?.accountStatus && r.target.accountStatus !== "ACTIVE" && <span className="ml-1 text-rose-500">· {STATUS_LABEL[r.target.accountStatus] || r.target.accountStatus}</span>}
                    </p>
                    <p className="mt-0.5 line-clamp-3 text-sm text-ink-800">{r.target?.title || r.target?.text || <span className="italic text-ink-400">(media only)</span>}</p>
                  </div>
                </div>
                {r.status === "pending" && (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => dismiss(r)} className="btn-outline flex-1 py-2 text-sm">Dismiss</button>
                    {r.kind === "user"
                      ? <button onClick={() => setPerson({ id: r.target?.id, fullName: r.author?.fullName, accountStatus: r.target?.accountStatus, profilePhoto: r.author?.profilePhoto })} className="btn flex-1 bg-rose-600 py-2 text-sm text-white hover:bg-rose-700"><Ban size={15} /> Review person</button>
                      : <button onClick={() => takedown(r)} className="btn flex-1 bg-rose-600 py-2 text-sm text-white hover:bg-rose-700"><Trash2 size={15} /> Remove {r.kind === "pulse" ? "Pulse" : "post"}</button>}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
      {error && rows.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}

      {/* Suspending the person closes their open profile reports as "actioned". */}
      {person && <UserDrawer userRow={person} onClose={() => setPerson(null)} onChanged={() => { setPerson(null); load(true); }} />}
    </div>
  );
}

/* =========================================================================
   Feedback
   ========================================================================= */
const FB_CATS = ["", "SUGGESTION", "IDEA", "BUG", "FEATURE_REQUEST", "EXPERIENCE"];
const FB_STATUSES = [["", "All"], ["NEW", "New"], ["REVIEWED", "Reviewed"], ["RESOLVED", "Resolved"]];
const FB_STATUS_CHIP: any = { NEW: "bg-brand-50 text-brand-700", REVIEWED: "bg-sky-50 text-sky-600", RESOLVED: "bg-emerald-50 text-emerald-600" };

function FeedbackSection() {
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("NEW");
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { limit: 20 };
      if (cat) params.category = cat;
      if (status) params.status = status;
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.feedback(params);
      if (!isCurrent()) return;
      setRows((p) => (reset ? d.feedback : [...p, ...d.feedback])); setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [cat, status, cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [cat, status]);

  const onUpdated = (row: any) => setRows((p) => p.map((f) => (f.id === row.id ? { ...f, ...row } : f)));

  return (
    <div>
      <SectionHead title="Feedback" subtitle="What users sent from the app and the website." />
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {FB_STATUSES.map(([k, l]) => <button key={k} onClick={() => setStatus(k)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold", status === k ? "bg-ink-900 text-white" : "bg-surface text-ink-600")}>{l}</button>)}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FB_CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold", cat === c ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}>{c ? c.replace("_", " ").toLowerCase() : "all types"}</button>)}
      </div>
      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty icon={MessageSquareText} title="No feedback here" />
            : rows.map((f) => <FeedbackItem key={f.id} f={f} onUpdated={onUpdated} />)}
        </div>
      )}
      {error && rows.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}
    </div>
  );
}

function FeedbackItem({ f, onUpdated }: { f: any; onUpdated: (row: any) => void }) {
  const [note, setNote] = useState(f.adminNote || "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async (body: any) => {
    setBusy(true); setMsg("");
    try { const row = await dok.admin.updateFeedback(f.id, body); onUpdated(row); setEditing(false); }
    catch (e: any) { setMsg(actionError(e)); }
    setBusy(false);
  };

  return (
    <div className="flex gap-3 p-4">
      <Avatar user={f.user} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-brand-50 text-[10px] text-brand-700">{f.category?.replace("_", " ").toLowerCase()}</span>
          <span className={cn("chip text-[10px]", FB_STATUS_CHIP[f.status] || "bg-ink-900/[.06] text-ink-600")}>{String(f.status || "NEW").toLowerCase()}</span>
          {f.rating && <span className="text-xs text-amber-500">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>}
          <span className="text-xs text-ink-400">{f.user?.fullName || "[deleted user]"} · {f.platform && f.platform !== "unknown" ? `${f.platform} · ` : ""}{timeAgo(f.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm text-ink-800">{f.message}</p>
        {f.images?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {f.images.map((img: any, i: number) => img.url
              ? <a key={i} href={img.url} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer"><img src={img.url} alt={`Screenshot ${i + 1}`} referrerPolicy="no-referrer" loading="lazy" className="h-16 w-16 rounded-lg border border-ink-900/[.08] object-cover" /></a>
              : <span key={i} className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-ink-900/[.15] text-[10px] text-ink-400">unavailable</span>)}
          </div>
        )}
        {f.adminNote && !editing && <p className="mt-2 rounded-lg bg-ink-900/[.03] p-2 text-xs text-ink-600">Note: {f.adminNote}</p>}
        {editing && (
          <div className="mt-2 space-y-1.5">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={2000} placeholder="Private note (only admins see this)…" className="input resize-none text-sm" />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-outline px-3 py-1.5 text-xs">Cancel</button>
              <button disabled={busy} onClick={() => save({ adminNote: note })} className="btn-primary px-3 py-1.5 text-xs">Save note</button>
            </div>
          </div>
        )}
        {msg && <p className="mt-1.5 text-xs text-rose-600">{msg}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {f.status !== "REVIEWED" && <button disabled={busy} onClick={() => save({ status: "REVIEWED" })} className="btn-outline px-2.5 py-1 text-[11px]">Mark reviewed</button>}
          {f.status !== "RESOLVED" && <button disabled={busy} onClick={() => save({ status: "RESOLVED" })} className="btn-outline px-2.5 py-1 text-[11px]">Resolve</button>}
          {f.status !== "NEW" && <button disabled={busy} onClick={() => save({ status: "NEW" })} className="btn-outline px-2.5 py-1 text-[11px]">Reopen</button>}
          {!editing && <button onClick={() => { setNote(f.adminNote || ""); setEditing(true); }} className="btn-outline px-2.5 py-1 text-[11px]">{f.adminNote ? "Edit note" : "Add note"}</button>}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Consultation ratings (patient star feedback after a completed consult)
   ========================================================================= */
const RATING_STARS = ["", "1", "2", "3", "4", "5"];

function RatingsSection() {
  const [stars, setStars] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ avgRating: number; totalRatings: number } | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { limit: 20 };
      if (stars) params.stars = stars;
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.consultationRatings(params);
      if (!isCurrent()) return;
      setRows((p) => (reset ? d.ratings : [...p, ...d.ratings]));
      setHasMore(d.hasMore); setCursor(d.nextCursor); setSummary(d.summary);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [stars, cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [stars]);

  return (
    <div>
      <SectionHead title="Consultation ratings" subtitle="Star feedback patients left after a completed consultation." />
      {summary && (
        <div className="mb-4 flex items-center gap-2">
          <span className="chip bg-brand-50 text-brand-700"><Star size={13} /> {summary.avgRating.toFixed(1)} avg</span>
          <span className="chip bg-surface text-ink-600">{summary.totalRatings} total</span>
        </div>
      )}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {RATING_STARS.map((c) => <button key={c} onClick={() => setStars(c)} className={cn("whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold", stars === c ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}>{c ? `${c} ★` : "all"}</button>)}
      </div>
      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty icon={Star} title="No ratings yet" />
            : rows.map((r) => (
              <div key={r.id} className="flex gap-3 p-4">
                <Avatar user={r.requester} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="chip bg-brand-50 text-brand-700 text-[10px]">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                    <span className="text-xs text-ink-400">{r.requester?.fullName} → Dr. {r.doctor?.fullName} · {timeAgo(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-ink-800">{r.comment}</p>}
                </div>
              </div>
            ))}
        </div>
      )}
      {error && rows.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}
    </div>
  );
}

/* =========================================================================
   Deletions queue
   ========================================================================= */
function DeletionsSection() {
  const [view, setView] = useState<"pending" | "archived">("pending");
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<any>(null);

  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { status: view, limit: 20 };
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.deletions(params);
      if (!isCurrent()) return;
      setRows((p) => (reset ? (d.users || []) : [...p, ...(d.users || [])])); setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [view, cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [view]);

  return (
    <div>
      <SectionHead title="Deletions" subtitle="Accounts their owners deleted. Nothing here is erased — see “How accounts work” below." />
      <div className="mb-4 flex gap-2">
        <button onClick={() => setView("pending")} className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold", view === "pending" ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}><Clock size={15} /> In recovery period</button>
        <button onClick={() => setView("archived")} className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold", view === "archived" ? "bg-brand-600 text-white" : "bg-surface text-ink-600")}><Archive size={15} /> Archived</button>
      </div>
      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty icon={view === "pending" ? Clock : Archive} title={view === "pending" ? "No accounts in their recovery period" : "No archived accounts"} />
            : rows.map((u) => {
              const left = daysUntil(u.scheduledDeletionAt);
              return (
                <button key={u.id} onClick={() => setSel(u)} className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-ink-900/[.02]">
                  <Avatar user={u} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{u.fullName || "—"}</p>
                    <p className="truncate text-xs text-ink-500">
                      {plainIdent(u.email || u.phoneNumber) || u.uniqueUsername || u.id}
                      {u.deletionRequestedAt ? ` · requested ${formatDate(u.deletionRequestedAt)}` : ""}
                    </p>
                  </div>
                  {view === "pending"
                    ? <span className="chip bg-amber-50 text-[10px] text-amber-600">recovery ends {formatDate(u.scheduledDeletionAt)}{left != null ? ` · ${left} day${left === 1 ? "" : "s"} left` : ""}</span>
                    : <span className="chip bg-sky-50 text-[10px] text-sky-600">archived {formatDate(u.frozenAt)}</span>}
                </button>
              );
            })}
        </div>
      )}
      {error && rows.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}

      <div className="mt-6"><AccountRulesCard /></div>

      {sel && <UserDrawer userRow={sel} onClose={() => setSel(null)} onChanged={() => { setSel(null); load(true); }} />}
    </div>
  );
}

/* =========================================================================
   Audit log
   ========================================================================= */
function AuditSection() {
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const begin = useRequestSeq();
  const load = useCallback(async (reset = true) => {
    const isCurrent = begin();
    setLoading(true); setError("");
    try {
      const params: any = { limit: 30 };
      if (!reset && cursor) params.cursor = cursor;
      const d = await dok.admin.audit(params);
      if (!isCurrent()) return;
      setRows((p) => (reset ? d.entries : [...p, ...d.entries])); setHasMore(d.hasMore); setCursor(d.nextCursor);
    } catch (e) {
      if (!isCurrent()) return;
      if (reset) setRows([]);
      setError(errorText(e));
    }
    setLoading(false);
  }, [cursor, begin]);
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <SectionHead title="Audit log" subtitle="Every action taken from this console, and automatic ones (shown as “system”)." />
      {error && rows.length === 0 ? <ErrorState message={error} onRetry={() => load(true)} /> : (
        <div className="card divide-y divide-ink-900/[.05]">
          {loading && rows.length === 0 ? <RowsSkeleton count={4} />
            : rows.length === 0 ? <Empty icon={ScrollText} title="No activity yet" />
            : rows.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-900/[.04] text-ink-500"><Dot size={22} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{e.action}</p>
                  <p className="truncate text-xs text-ink-500">
                    {e.adminUsername || "—"} · {e.targetType || ""} {e.targetId ? `#${String(e.targetId).slice(0, 8)}` : ""} · {timeAgo(e.createdAt)}
                    {e.metadata?.reason ? ` · "${e.metadata.reason}"` : ""}
                  </p>
                </div>
                {e.ipAddress && <span className="text-[10px] text-ink-400">{e.ipAddress}</span>}
              </div>
            ))}
        </div>
      )}
      {error && rows.length > 0 && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      {hasMore && <button onClick={() => load(false)} disabled={loading} className="btn-outline mx-auto mt-4 block px-4 py-2 text-sm">{loading ? "Loading…" : "Load more"}</button>}
    </div>
  );
}

/* =========================================================================
   Drawer shell
   ========================================================================= */
function Drawer({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/40" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-full max-w-md animate-[scale-in_.3s_cubic-bezier(.21,.65,.36,1)_both] flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-900/[.06] p-5">
          <h3 className="font-display text-lg font-extrabold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-900/5"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
