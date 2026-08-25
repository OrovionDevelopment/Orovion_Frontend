"use client";
import { Link } from "@/lib/router";
import { ArrowRight, ArrowLeft, Linkedin, Instagram, Mail, MapPin, GraduationCap } from "lucide-react";
import NavArrows from "@/components/ui/NavArrows";
import { SiteNav, SiteFooter } from "@/components/landing/SiteChrome";
import TeamAvatar from "@/components/landing/TeamAvatar";
import { TEAM, TeamMember } from "@/lib/team";
import { useScrollReveal } from "@/lib/utils";

/**
 * /team/[slug] — one founder's own page.
 *
 * Split out of the combined /team list so each founder has a canonical URL that
 * can rank for their name and carry a `Person` JSON-LD entity. The list page
 * still shows everyone; this is the destination its cards link to.
 */
export default function TeamMemberPage({ member: m }: { member: TeamMember }) {
  useScrollReveal();
  const others = TEAM.filter((x) => x.slug !== m.slug);

  return (
    <div className="overflow-x-clip bg-surface">
      <NavArrows variant="floating" />
      <SiteNav />

      <article>
        {/* hero */}
        <section className="relative">
          <div className="absolute inset-0 mesh" />
          <div className="absolute inset-x-0 top-0 h-[420px] grid-bg" />
          <div className="container-x relative pb-12 pt-12 lg:pb-16 lg:pt-20">
            <Link
              to="/team"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:gap-2.5"
            >
              <ArrowLeft size={15} /> All of the team
            </Link>
            <div className="mt-8 grid items-start gap-8 md:grid-cols-[300px_1fr] md:gap-10 lg:grid-cols-[340px_1fr]">
              {/* profile card */}
              <div className="md:sticky md:top-24 lg:top-28">
                <div className="card overflow-hidden">
                  {/* cover — the backdrop is the literal color baked into
                      Cover.png (NOT a theme var: it must match the asset even
                      if the accent is rethemed). */}
                  <div className="relative h-44">
                    <div className="absolute inset-0 bg-[#1e7b74]" />
                    <img src="/team/Cover.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain object-center" />
                  </div>
                  <div className="px-6 pb-6">
                    <div className="relative z-10 -mt-12 w-max rounded-3xl bg-surface p-1.5 shadow-card">
                      <TeamAvatar member={m} className="h-24 w-24 rounded-2xl text-2xl" />
                    </div>
                    <p className="mt-4 font-display text-xl font-extrabold text-ink-900">{m.name}</p>
                    <p className="text-sm font-semibold text-brand-700">{m.role}</p>
                    <ul className="mt-5 space-y-2.5 text-sm text-ink-600">
                      <li className="flex items-center gap-2.5"><GraduationCap size={16} className="shrink-0 text-ink-400" /> {m.education}</li>
                      <li className="flex items-center gap-2.5"><MapPin size={16} className="shrink-0 text-ink-400" /> {m.location}</li>
                    </ul>
                    <div className="mt-5 flex gap-2 border-t border-ink-900/[.06] pt-4">
                      {m.socials.linkedin && <SocialButton href={m.socials.linkedin} label={`${m.name} on LinkedIn`} icon={Linkedin} />}
                      {m.socials.instagram && <SocialButton href={m.socials.instagram} label={`${m.name} on Instagram`} icon={Instagram} />}
                      {m.socials.email && <SocialButton href={`mailto:${m.socials.email}`} label={`Email ${m.name}`} icon={Mail} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* story — the only <h1> on the page */}
              <div className="min-w-0">
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-900 text-balance sm:text-5xl">{m.name}</h1>
                <p className="mt-2 text-base font-semibold text-brand-700">{m.role}</p>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">{m.tagline}</p>
                <div className="mt-8 max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-600">
                  {m.story.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <h2 className="mt-10 text-xs font-bold uppercase tracking-wider text-ink-400">Focus</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.focus.map((f) => <span key={f} className="chip bg-brand-50 text-brand-700">{f}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* the rest of the team — internal links so no member page is an orphan */}
      <section className="container-x py-14 sm:py-20">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">The rest of the team</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              to={`/team/${o.slug}`}
              className="card group flex items-center gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow"
            >
              <TeamAvatar member={o} className="h-14 w-14 shrink-0 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-ink-900 transition group-hover:text-brand-700">{o.name}</p>
                <p className="truncate text-sm font-semibold text-brand-700">{o.role}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-700" />
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SocialButton({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="press grid h-10 w-10 place-items-center rounded-full bg-ink-900/[.05] text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
    >
      <Icon size={16} />
    </a>
  );
}
