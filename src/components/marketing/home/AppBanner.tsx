import Image from "next/image";
import { Bell, Bookmark, Heart, Home, MessageCircle, Plus, Stethoscope, User, Users } from "lucide-react";
import { Link } from "@/lib/router";
import { HOME } from "@/lib/marketing";
import { Verified } from "@/components/ui/Primitives";
import StoreBadge from "@/components/ui/StoreBadge";
import { FillText } from "../Type";

/**
 * Placeholder app screen — a small Orovion feed. Replace it with a real
 * screenshot by setting `HOME.app.screenshot` (src/lib/marketing.ts).
 */
function MockScreen() {
  return (
    <div className="flex h-full flex-col bg-ink-50 text-ink-900">
      <div className="flex items-center justify-between bg-surface px-4 pb-2.5 pt-9">
        <span className="flex items-center gap-1.5 text-[13px] font-bold">
          <img src="/brand/icon-secondary.svg" alt="" aria-hidden width={18} height={18} className="h-[18px] w-[18px]" />
          Orovion
        </span>
        <Bell size={15} className="text-ink-500" />
      </div>

      <div className="flex-1 space-y-2.5 overflow-hidden p-2.5">
        <div className="rounded-2xl bg-surface p-3 shadow-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">SR</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-bold">Dr. Sara Reyes <Verified size={11} /></p>
              <p className="text-[9px] text-ink-500">Cardiology · 2h</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-snug text-ink-700">Reading a paediatric ECG in 60 seconds — rate, rhythm, axis.</p>
          <div className="mt-2 h-24 rounded-xl bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300" />
          <div className="mt-2.5 flex items-center gap-4 text-[10px] text-ink-500">
            <span className="flex items-center gap-1"><Heart size={12} /> 1.2k</span>
            <span className="flex items-center gap-1"><MessageCircle size={12} /> 86</span>
            <Bookmark size={12} className="ml-auto" />
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-3 shadow-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-800 text-[11px] font-bold text-white">AM</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-bold">Dr. Arjun Mehta <Verified size={11} /></p>
              <p className="text-[9px] text-ink-500">Case study · 5h</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-snug text-ink-700">What makes a case discussion useful? A clear question and an honest timeline.</p>
        </div>
      </div>

      <div className="flex items-center justify-around bg-surface px-2 pb-4 pt-2.5 text-ink-400 shadow-[0_-1px_0_rgb(var(--ink-900)/.06)]">
        <Home size={17} className="text-brand-600" />
        <Users size={17} />
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white"><Plus size={16} /></span>
        <Stethoscope size={17} />
        <User size={17} />
      </div>
    </div>
  );
}

/**
 * "Get the app" (home, above the FAQ), after the QuickMFB download banner: a
 * large rounded brand-colour banner with the headline, one line and the store
 * badges on the left and a phone that pokes
 * out above the banner on the right. On phones the phone sits on top, centred.
 * Store badges point to /mobile-app until the store
 * listings are live. The older thread-and-QR version is still in GetApp.tsx.
 */
export default function AppBanner() {
  const a = HOME.app;
  return (
    <section id="get-the-app" aria-label="Get the Orovion app" className="relative scroll-mt-24 pb-20 pt-32 tab:pb-28 tab:pt-44 desk:pb-40">
      <div className="mk-container">
        <div className="mk-reveal relative rounded-[28px] bg-brand-800 text-white tab:rounded-[40px]">
          {/* phone — decorative, so hidden from assistive tech; DOM-first so it stacks on top on phones */}
          <div aria-hidden data-depth={40} className="relative mx-auto -mt-28 w-[230px] tab:absolute tab:-top-24 tab:right-[6%] tab:mx-0 tab:mt-0 tab:w-[250px] desk:w-[290px]">
            {a.screenshot ? (
              /* A ready-made phone picture (its own frame, transparent corners): shown whole, at its own proportions. */
              <Image src={a.screenshot} alt="" width={0} height={0} sizes="(min-width: 1200px) 290px, 250px" className="h-auto w-full drop-shadow-[0_30px_35px_rgba(0,0,0,.4)]" />
            ) : (
              <div className="rounded-[40px] bg-ink-950 p-[9px] shadow-[0_34px_60px_-24px_rgba(0,0,0,.55)] ring-1 ring-white/10">
                <div className="relative aspect-[9/18.5] overflow-hidden rounded-[32px] bg-surface">
                  <span className="absolute left-1/2 top-2 z-10 h-[18px] w-24 -translate-x-1/2 rounded-full bg-ink-950" />
                  <MockScreen />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-6 px-6 pb-10 pt-8 tab:max-w-[56%] tab:px-12 tab:py-16 desk:px-16 desk:py-20">
            <h2 className="mk-reveal t-display-sm text-balance text-white"><FillText>{a.title} {a.accent}</FillText></h2>
            <p className="mk-reveal max-w-[460px] t-body text-white/75">{a.text}</p>
            <div className="mk-reveal flex items-center gap-4 pt-2">
              <Link to={a.to} data-cursor="snap" className="group rounded-xl" aria-label="Orovion on the App Store — learn more"><StoreBadge store="apple" /></Link>
              <Link to={a.to} data-cursor="snap" className="group rounded-xl" aria-label="Orovion on Google Play — learn more"><StoreBadge store="google" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
