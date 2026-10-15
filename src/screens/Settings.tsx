"use client";
import Roll from "@/components/ui/Roll";
import { useEffect, useRef, useState } from "react";
import {
  User, Bell, Lock, Smartphone, Palette, ChevronRight,
  LogOut, Globe, Eye, Trash2, ArrowUpRight, ShieldOff, Loader2, Check, X,
  MessageSquare, Star, ImagePlus,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Primitives";
import { RowsSkeleton, TextBlockSkeleton } from "@/components/ui/Skeletons";
import AppearanceStudio from "@/components/settings/AppearanceStudio";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@/lib/router";
import { dok } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { useAccountPolicy, recoveryPhrase } from "@/hooks/useAccountPolicy";

const SECTIONS = [
  { key: "account", icon: User, label: "Account", desc: "Name, headline, contact" },
  { key: "privacy", icon: Lock, label: "Privacy", desc: "Calls & blocked accounts" },
  { key: "devices", icon: Smartphone, label: "Sessions & devices", desc: "Logged-in devices" },
  { key: "notifications", icon: Bell, label: "Notifications", desc: "What you get pinged about" },
  { key: "appearance", icon: Palette, label: "Appearance", desc: "Theme, colors, chat & fonts" },
  { key: "feedback", icon: MessageSquare, label: "Send feedback", desc: "Ideas, bugs, suggestions" },
];

export default function Settings() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const [active, setActive] = useState("account");

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <PageHeader title="Settings" subtitle="Manage your account, privacy and devices" />
      <div className="grid gap-5 md:grid-cols-[230px_1fr]">
        <nav className="card h-fit p-2">
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left transition",
                active === s.key ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-900/[.03]")}>
              <s.icon size={18} className={active === s.key ? "text-brand-600" : "text-ink-400"} />
              <span className="flex-1 text-sm font-semibold">{s.label}</span>
              <ChevronRight size={15} className={cn("transition", active === s.key ? "translate-x-0.5 text-brand-500" : "text-ink-300")} />
            </button>
          ))}
          <div className="my-1 h-px bg-ink-900/[.06]" />
          {[["Help center", "/help"], ["Privacy policy", "/privacy"], ["Terms of Use", "/terms"]].map(([label, href]) => (
            <a key={href} href={href} target="_blank" rel="noopener" className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-ink-700 transition hover:bg-ink-900/[.03]">
              <span className="flex-1 text-sm font-semibold">{label}</span>
              <ChevronRight size={15} className="text-ink-300" />
            </a>
          ))}
          <div className="my-1 h-px bg-ink-900/[.06]" />
          <button onClick={async () => { await logout(); nav("/"); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-rose-600 hover:bg-rose-50">
            <LogOut size={18} /> <span className="text-sm font-semibold">Log out</span>
          </button>
        </nav>

        <div className="space-y-4">
          {active === "account" && <Account />}
          {active === "privacy" && <Privacy />}
          {active === "devices" && <Devices />}
          {active === "feedback" && <Feedback />}
          {active === "notifications" && <Notifications />}
          {active === "appearance" && <Appearance />}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, className }: { title?: string; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("card p-5", className)}>
      {title && <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-400">{title}</h2>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Field({ label, value, onChange, type = "text", hint, readOnly }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span>
      <input value={value ?? ""} onChange={onChange ? (e) => onChange(e.target.value) : undefined} type={type} readOnly={readOnly}
        className={cn("input", readOnly && "bg-ink-900/[.03] text-ink-500")} />
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}
function Toggle({ label, desc, on, onChange, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={17} /></span>}
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        {desc && <p className="text-xs text-ink-500">{desc}</p>}
      </div>
      <button onClick={() => onChange?.(!on)} className={cn("relative h-6 w-11 rounded-full transition", on ? "bg-brand-600" : "bg-ink-900/15")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[1.4rem]" : "left-0.5")} />
      </button>
    </div>
  );
}
function DemoNote() {
  const nav = useNavigate();
  return <Card><p className="text-sm text-ink-500">You're exploring the demo. <button onClick={() => nav("/login")} className="font-semibold text-brand-700">Sign in</button> to manage these settings.</p></Card>;
}

/* ───────────────────────── Account ───────────────────────── */
function Account() {
  const { user, demo, updateUser } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ fullName: user?.fullName || "", professionalHeadline: user?.professionalHeadline || user?.headline || "", city: user?.city || "", workEmail: user?.workEmail || "" });
  const [pd, setPd] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (demo) return;
    dok.account.personalDetails().then(setPd).catch(() => {});
  }, [demo]);

  const save = async () => {
    setMsg(""); setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ""));
      const res = await dok.profile.updateBasic(payload);
      updateUser(res.user || payload);
      setMsg("Saved ✓");
    } catch (e) { setMsg(e?.response?.data?.message || "Couldn't save."); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Card title="Profile">
        <div className="flex items-center gap-4">
          <Avatar user={user} size={64} />
          <button onClick={() => nav("/app/profile/edit")} className="btn-outline px-4 py-2 text-sm"><Roll>Edit full profile</Roll> <ArrowUpRight size={15} /></button>
        </div>
        <Field label="Full name" value={f.fullName} onChange={set("fullName")} />
        <Field label="Professional headline" value={f.professionalHeadline} onChange={set("professionalHeadline")} />
        <Field label="City" value={f.city} onChange={set("city")} />
        <Field label="Work email" type="email" value={f.workEmail} onChange={set("workEmail")} />
        {msg && <p className={cn("text-sm", msg.includes("✓") ? "text-emerald-600" : "text-rose-600")}>{msg}</p>}
        <div className="flex justify-end">
          <button onClick={save} disabled={saving || demo} className="btn-primary px-5 py-2.5 text-sm"><Roll>{saving ? "Saving…" : "Save changes"}</Roll></button>
        </div>
      </Card>
      <UsernameCard />
      <Card title="Login & contact">
        <Field label="Phone" value={pd ? `${pd.countryCode || ""} ${pd.phoneNumber || ""}`.trim() : "—"} readOnly hint="Used for login & OTP" />
        <Field label="Email" value={pd?.email || "Not set"} readOnly hint={pd?.emailVerified ? "Verified" : "Set & verify from your profile"} />
        <Field label="Member since" value={pd?.registeredAt ? new Date(pd.registeredAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"} readOnly />
      </Card>
      <DangerZone />
    </>
  );
}

/* ───────────────────────── Username (real-time availability) ───────────────────────── */
function UsernameCard() {
  const { user, demo, updateUser } = useAuth();
  const current = user?.uniqueUsername || "";
  const [value, setValue] = useState(current);
  const [status, setStatus] = useState(null); // { ok, msg }
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounce = useRef(null);

  // Allowed set: a-z 0-9 . _  (lower-cased, ≤30) — mirrors the server rule.
  const norm = (v) => v.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30).toLowerCase();
  const changed = value !== current && value.length > 0;

  const formatError = (v) => {
    if (v.length < 3) return "Must be at least 3 characters";
    if (!/^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/.test(v)) return "Must start and end with a letter or number";
    if (/\.\./.test(v)) return "No consecutive dots";
    return null;
  };

  useEffect(() => {
    clearTimeout(debounce.current);
    setSaved(false);
    if (!changed) { setStatus(null); return undefined; }
    const fmt = formatError(value);
    if (fmt) { setStatus({ ok: false, msg: fmt }); setChecking(false); return undefined; }
    if (demo) { setStatus({ ok: true, msg: "Username available" }); return undefined; }
    setChecking(true); setStatus(null);
    debounce.current = setTimeout(async () => {
      try {
        const d = await dok.profile.usernameCheck(value);
        setStatus(d.available ? { ok: true, msg: "Username available" } : { ok: false, msg: d.reason || "Username already taken" });
      } catch {
        setStatus({ ok: false, msg: "Couldn't check right now — try again" });
      } finally { setChecking(false); }
    }, 400);
    return () => clearTimeout(debounce.current);
  }, [value, changed, demo]);

  const canSave = changed && status?.ok && !checking && !saving && !demo;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const d = await dok.profile.updateUsername(value);
      const next = d.uniqueUsername || value;
      updateUser({ uniqueUsername: next });
      setValue(next);
      setStatus(null);
      setSaved(true);
    } catch (e) {
      setStatus({ ok: false, msg: e?.response?.data?.message || "This username has just been taken. Please choose another." });
    } finally { setSaving(false); }
  };

  return (
    <Card title="Username">
      <span className="block text-sm font-semibold text-ink-700">Unique username</span>
      <div className="flex items-center rounded-xl border border-ink-900/[.12] bg-surface px-3 transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <span className="text-sm font-semibold text-ink-400">@</span>
        <input value={value} onChange={(e) => setValue(norm(e.target.value))} placeholder="username" className="flex-1 bg-transparent px-1.5 py-3 text-sm outline-none" />
        {checking && <Loader2 size={15} className="animate-spin text-ink-400" />}
      </div>
      {status && (
        <p className={cn("flex items-center gap-1.5 text-sm", status.ok ? "text-emerald-600" : "text-rose-600")}>
          {status.ok ? <Check size={14} /> : <X size={14} />} {status.msg}
        </p>
      )}
      {saved && <p className="text-sm text-emerald-600">Username updated ✓ — mentions and your profile link now use @{value}</p>}
      <p className="text-xs text-ink-400">3–30 characters · lowercase letters, numbers, periods and underscores.</p>
      <div className="flex justify-end">
        <button onClick={save} disabled={!canSave} className="btn-primary px-5 py-2.5 text-sm"><Roll>{saving ? "Saving…" : "Save username"}</Roll></button>
      </div>
    </Card>
  );
}

/* ───────────────────────── Privacy ───────────────────────── */
function Privacy() {
  const { demo } = useAuth();
  const [p, setP] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (demo) return;
    dok.account.privacy().then(setP).catch(() => setP({ profileVisibility: "public", callPermissions: "everyone" }));
  }, [demo]);

  const update = async (patch) => {
    const next = { ...p, ...patch };
    setP(next); setSaving(true);
    try { await dok.account.updatePrivacy(patch); } catch { /* revert silently */ }
    finally { setSaving(false); }
  };

  if (demo) return <DemoNote />;
  if (!p) return <Card><TextBlockSkeleton lines={3} /></Card>;

  const CALLS = [{ v: "everyone", l: "Everyone" }, { v: "connections", l: "Connections" }, { v: "nobody", l: "Nobody" }];
  return (
    <Card title="Calls" className="bg-narvik dark:bg-ink-100">
      {/* The "Private account" toggle was removed: every profile on Orovion is
          public. Followers, following, posts and pulses are visible to anyone,
          and a follow never needs approval. */}
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-700"><Globe size={15} className="text-ink-400" /> Who can call you</p>
        <div className="flex gap-2">
          {CALLS.map((c) => (
            <button key={c.v} onClick={() => update({ callPermissions: c.v })}
              className={cn("flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition", p.callPermissions === c.v ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-900/10 text-ink-600 hover:border-brand-300")}>
              {c.l}
            </button>
          ))}
        </div>
      </div>
      {saving && <p className="text-xs text-ink-400">Saving…</p>}
    </Card>
  );
}

/* ───────────────────────── Sessions & devices ───────────────────────── */
function Devices() {
  const { demo, logout } = useAuth();
  const nav = useNavigate();
  // "loading" | "ok" | "linked" (this device signed in by QR) | "error"
  const [status, setStatus] = useState("loading");
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // GET /auth/sessions is primary-only: a device that signed in by scanning a QR
  // code is a SECONDARY session and gets a 403 ("Secondary devices cannot view
  // other sessions"). That is deliberate, but it must NOT be swallowed — treating
  // the 403 as an empty list renders "No other active sessions", which tells the
  // user they have no other devices when their phone is almost certainly signed in.
  const load = () =>
    dok.auth.sessions()
      .then((d) => { setList(d.sessions || d || []); setStatus("ok"); })
      .catch((e) => setStatus(e?.response?.status === 403 ? "linked" : "error"));
  useEffect(() => { if (!demo) load(); }, [demo]);

  const revoke = async (id) => { setBusy(true); try { await dok.auth.revokeSession(id); await load(); } finally { setBusy(false); } };
  const logoutAll = async () => { setBusy(true); try { await dok.auth.logoutAll(); await load(); } finally { setBusy(false); } };

  if (demo) return <DemoNote />;
  if (status === "loading") return <Card><RowsSkeleton count={2} /></Card>;

  if (status === "linked") {
    return (
      <Card title="This device">
        <div className="flex gap-3 rounded-xl border border-ink-900/[.06] bg-ink-900/[.02] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Smartphone size={18} /></span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink-900">Signed in from a QR scan</p>
            <p className="text-sm leading-relaxed text-ink-500">
              You linked this browser by scanning a code with your phone. For your security a linked
              device can't view or manage your other sessions.
            </p>
            <p className="text-sm leading-relaxed text-ink-500">
              To see every signed-in device, open <span className="font-semibold text-ink-700">Settings → Sessions &amp; devices</span> on the phone you scanned with.
            </p>
          </div>
        </div>
        <button onClick={async () => { await logout(); nav("/"); }} className="btn-outline w-full py-2.5 text-sm">
          <LogOut size={16} /> <Roll>Log out this device</Roll>
        </button>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card title="Logged-in devices">
        <p className="text-sm text-ink-500">We couldn't load your devices just now.</p>
        <button onClick={() => { setStatus("loading"); load(); }} className="btn-outline w-full py-2.5 text-sm"><Roll>Try again</Roll></button>
      </Card>
    );
  }

  return (
    <Card title="Logged-in devices">
      {list.length === 0 && <p className="text-sm text-ink-500">No other active sessions.</p>}
      {list.map((s) => (
        <div key={s._id} className="flex items-center gap-3 rounded-xl border border-ink-900/[.06] p-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900/[.04]"><Smartphone size={18} className="text-ink-600" /></span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{s.deviceName || s.platform || "Device"}</p>
            <p className="text-xs text-ink-500">{[s.platform, s.city, s.lastActiveAt && new Date(s.lastActiveAt).toLocaleString()].filter(Boolean).join(" · ")}</p>
          </div>
          <button onClick={() => revoke(s._id)} disabled={busy} className="text-xs font-semibold text-rose-600 hover:underline">Revoke</button>
        </div>
      ))}
      {list.length > 0 && (
        <button onClick={logoutAll} disabled={busy} className="btn-outline w-full py-2.5 text-sm"><ShieldOff size={16} /> <Roll>Log out all devices</Roll></button>
      )}
    </Card>
  );
}

/* ───────────────────────── Danger zone (deactivate / delete) ───────────────────────── */
// The recovery period comes from the server (useAccountPolicy) — never a
// number written here. Plain-language rules: Api_service/docs/ACCOUNT_LIFECYCLE.md.
function DangerZone() {
  const { demo, logout } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const period = recoveryPhrase(useAccountPolicy());

  const deactivate = async () => {
    if (demo || !confirm("Deactivate your account?\n\nYour profile is hidden and you are signed out everywhere. Nothing is deleted — logging back in reactivates it.")) return;
    setBusy("deactivate"); setError("");
    try { await dok.account.deactivate(); await logout(); nav("/"); }
    catch (e: any) { setError(e?.response?.data?.message || "Couldn't deactivate your account. Please try again."); }
    finally { setBusy(""); }
  };
  const remove = async () => {
    if (demo || !confirm(`Delete your account?\n\nYour profile, posts and Pulses are hidden right away and you are signed out everywhere. You have ${period} to change your mind — just log in again and everything comes back. After that the account is archived and can no longer be restored.`)) return;
    setBusy("delete"); setError("");
    try {
      const r = await dok.account.remove();
      if (r?.scheduledDeletionAt) alert(`Your account is scheduled for deletion. Log in before ${formatDate(r.scheduledDeletionAt)} if you change your mind.`);
      await logout(); nav("/");
    } catch (e: any) { setError(e?.response?.data?.message || "Couldn't delete your account. Please try again."); }
    finally { setBusy(""); }
  };

  return (
    <Card title="Danger zone">
      <button onClick={deactivate} disabled={!!busy || demo} className="flex w-full items-center gap-3 rounded-xl border border-amber-200 p-3 text-left text-amber-700 hover:bg-amber-50">
        <ShieldOff size={18} /><span className="text-sm font-semibold">{busy === "deactivate" ? "Deactivating…" : "Deactivate account"}</span>
      </button>
      <button onClick={remove} disabled={!!busy || demo} className="flex w-full items-center gap-3 rounded-xl border border-rose-200 p-3 text-left text-rose-600 hover:bg-rose-50">
        <Trash2 size={18} /><span className="text-sm font-semibold">{busy === "delete" ? "Scheduling…" : "Delete account"}</span>
      </button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <p className="text-xs leading-relaxed text-ink-500">
        <b>Deactivate</b> hides your account until you log in again. <b>Delete</b> can be undone for {period} by logging in;
        after that your account is archived and can't be restored. See the <a href="/help" className="text-brand-600 underline">Help center</a> for details.
      </p>
    </Card>
  );
}

/* ───────────────────────── Feedback ───────────────────────── */
const FEEDBACK_TYPES: [string, string][] = [
  ["suggestion", "Suggestion"], ["idea", "Idea"], ["bug", "Something's broken"],
  ["feature_request", "Feature request"], ["experience", "My experience"],
];
const FEEDBACK_MAX = 2000;
const FEEDBACK_IMAGES = 5;
const FEEDBACK_IMAGE_BYTES = 10 * 1024 * 1024;

function Feedback() {
  const { demo } = useAuth();
  const [category, setCategory] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setError("");
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) { setError("Screenshots must be images."); continue; }
      if (f.size > FEEDBACK_IMAGE_BYTES) { setError("Each screenshot must be under 10 MB."); continue; }
      if (next.length < FEEDBACK_IMAGES) next.push(f);
    }
    setFiles(next);
  };

  const send = async () => {
    const text = message.trim();
    if (!text) { setError("Please write your feedback."); return; }
    setBusy(true); setError("");
    try {
      if (files.length) {
        const form = new FormData();
        form.append("category", category);
        form.append("message", text);
        form.append("platform", "web");
        if (rating) form.append("rating", String(rating));
        files.forEach((f) => form.append("images", f));
        await dok.account.feedback(form);
      } else {
        await dok.account.feedback({ category, message: text, platform: "web", ...(rating ? { rating } : {}) });
      }
      setSent(true); setMessage(""); setRating(0); setFiles([]);
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status === 429
        ? "You've sent a lot of feedback recently. Please try again a little later."
        : e?.response?.data?.message || "Couldn't send your feedback. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Card title="Send feedback">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
          <Check size={20} /><p className="text-sm font-semibold">Thank you — our team reads every message.</p>
        </div>
        <button onClick={() => setSent(false)} className="btn-outline px-4 py-2 text-sm">Send more feedback</button>
      </Card>
    );
  }

  return (
    <Card title="Send feedback">
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_TYPES.map(([k, l]) => (
          <button key={k} onClick={() => setCategory(k)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold transition", category === k ? "bg-brand-600 text-white" : "bg-ink-900/[.04] text-ink-600 hover:bg-brand-50")}>{l}</button>
        ))}
      </div>
      <div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={FEEDBACK_MAX}
          placeholder="Tell us what's working, what isn't, or what you'd love to see…" className="input resize-none text-sm" />
        <p className="mt-1 text-right text-xs text-ink-400">{message.trim().length}/{FEEDBACK_MAX}</p>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-ink-500">How is Orovion working for you? (optional)</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(rating === n ? 0 : n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="p-1">
              <Star size={22} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-ink-300"} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <div className="flex flex-wrap items-center gap-2">
          {files.map((f, i) => (
            <span key={i} className="chip bg-ink-900/[.04] text-ink-600">
              {f.name.length > 22 ? `${f.name.slice(0, 20)}…` : f.name}
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove screenshot"><X size={12} /></button>
            </span>
          ))}
          {files.length < FEEDBACK_IMAGES && (
            <button onClick={() => fileInput.current?.click()} className="btn-outline px-3 py-1.5 text-xs"><ImagePlus size={14} /> Add screenshot</button>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-400">Up to {FEEDBACK_IMAGES} images, 10 MB each. Please don't include patient details.</p>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button onClick={send} disabled={busy || demo || !message.trim()} className="btn-primary w-full py-2.5 text-sm">
        {busy ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send feedback"}
      </button>
    </Card>
  );
}

/* ───────────────────────── Notifications & Appearance (device-local for now) ───────────────────────── */
function Notifications() {
  const [s, setS] = useState({ likes: true, comments: true, followers: true, requests: true, updates: false });
  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));
  return (
    <Card title="Push & email">
      <Toggle icon={Bell} label="Likes & reactions" desc="When someone reacts to your posts" on={s.likes} onChange={set("likes")} />
      <Toggle icon={Bell} label="Comments & replies" desc="Replies on your posts and cases" on={s.comments} onChange={set("comments")} />
      <Toggle icon={User} label="New followers" on={s.followers} onChange={set("followers")} />
      <Toggle icon={User} label="Connection requests" on={s.requests} onChange={set("requests")} />
      <Toggle icon={Globe} label="Product updates" desc="Orovion news and tips" on={s.updates} onChange={set("updates")} />
      <p className="text-xs text-ink-400">Saved on this device.</p>
    </Card>
  );
}
/** Appearance moved to its own studio: theme, accent color, typography, chat style. */
function Appearance() {
  return <AppearanceStudio />;
}
