"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  Globe,
  Users,
  Briefcase,
  GraduationCap,
  Home as HomeIcon,
  Watch,
  Trophy,
  Globe as GlobeIcon,
  Linkedin,
  Mail,
  BookOpen,
} from "lucide-react";
import { CursorGlow } from "@/components/CursorGlow";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const SECTION = "mt-20 sm:mt-28";

/* Amazon value cards */
const amazonCards = [
  {
    id: "agentic",
    title: "Agentic Auth",
    description:
      "Defining how AI agents securely interact within the Amazon ecosystem.",
    icon: Shield,
    delay: 0.08,
  },
  {
    id: "infra",
    title: "Global Infrastructure",
    description:
      "Managing Identity services with 99.999% availability for thousands of downstream developers.",
    icon: Globe,
    delay: 0.12,
  },
  {
    id: "leadership",
    title: "Leadership",
    description:
      "Leading multi-functional teams to ship AI builder tools at the limit of Ads-scale.",
    icon: Users,
    delay: 0.16,
  },
];

/* Field notes */
const fieldNotes = [
  { title: "Why Agents Need a Registry", date: "Jan 2025", readTime: "5 min read" },
  { title: "VC Lessons for SDMs", date: "Dec 2024", readTime: "5 min read" },
  { title: "Building Trust in Autonomous Workflows", date: "Nov 2024", readTime: "5 min read" },
];

/* Off-duty */
const offDuty = [
  { icon: Trophy, label: "Formula 1" },
  { icon: GlobeIcon, label: "Tennis" },
  { icon: GlobeIcon, label: "Shanghai" },
  { icon: GlobeIcon, label: "London" },
  { icon: GlobeIcon, label: "Medellín" },
];

function ProfilePhoto() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-full bg-zinc-800 text-3xl font-semibold text-zinc-500">
        PS
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-full">
      <Image
        src="/profile.jpg"
        alt="Pratham Sarin"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 240px, 320px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      {/* Dotted grid - 5% opacity */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Cursor-following glow */}
      <CursorGlow />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 md:px-10">
        {/* ─── Hero: Two-column identity ─── */}
        <motion.section
          id="hero"
          className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0 }}
        >
          {/* Live badge - top right */}
          <div className="absolute right-0 top-0 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 font-mono text-xs text-zinc-500 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] pulse-dot" aria-hidden />
            Live · Short Hills, NJ
          </div>

          {/* Left: Photo frame */}
          <motion.div
            className="relative"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.05 }}
          >
            <div className="ring-2 ring-[#0071bc] ring-offset-4 rounded-full p-1 ring-offset-[#050505]">
              <ProfilePhoto />
            </div>
          </motion.div>

          {/* Right: Identity */}
          <motion.div
            className="flex flex-col justify-center"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.08 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Pratham Sarin
            </h1>
            <p className="mt-3 text-lg text-zinc-500">
              Senior SDM @ Amazon | AI Builder Infrastructure
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-500">
              Architecting the next generation of Identity & Auth for autonomous
              agents. Bridging founder grit with global scale.
            </p>
          </motion.div>
        </motion.section>

        {/* ─── Primary: The Scale Era (Amazon) ─── */}
        <section id="amazon" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.12 }}
          >
            THE SCALE ERA: AMAZON (2018 – PRESENT)
          </motion.h2>
          <motion.p
            className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-500"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.14 }}
          >
            Progression from Sr. PM-T to Senior SDM. Leading the Agent Identity
            &amp; Authorization service—defining how AI builders securely operate
            at Amazon scale.
          </motion.p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {amazonCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{ ...fadeInUp.transition, delay: card.delay }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-[#0071bc]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {card.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* ─── Secondary: The Grit Era + Cornell Bridge ─── */}
        <section className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${SECTION}`}>
          <motion.article
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <span className="font-mono text-xs tracking-wider text-zinc-500">
              THE GRIT ERA
            </span>
            <h3 className="mt-3 text-xl font-semibold text-white">
              Startup Employee #1
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Built a market-leading health-tech platform from zero to millions of
              users. Raw impact of scaling engineering from a garage to a national
              leader—inventory, payments, logistics from scratch.
            </p>
          </motion.article>

          <motion.article
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.24 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-[#0071bc]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">
              Cornell Johnson MBA
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              The pivot from pure engineering to venture-minded technical
              leadership. Merit Scholar, BR Venture Fund Associate—the bridge
              between code and capital.
            </p>
          </motion.article>
        </section>

        {/* ─── Personal Bento ─── */}
        <section className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.26 }}
          >
            BEYOND THE BUILD
          </motion.h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Family & Life - medium card */}
            <motion.article
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:col-span-2 sm:p-8"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.28 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-[#0071bc]">
                <HomeIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                Family & Life
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Father of two. Resident of Short Hills. Enthusiast of spicy Indian
                cuisine and high-precision engineering.
              </p>
            </motion.article>

            {/* The Collector - horology */}
            <motion.article
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-[#0071bc]">
                <Watch className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                The Collector
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Horology—Rolex, AP, and the art of precision movements as a
                metaphor for software architecture.
              </p>
            </motion.article>

            {/* Off-Duty: F1, Tennis, Travel */}
            <motion.article
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:col-span-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-8"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.32 }}
            >
              <span className="font-mono text-xs tracking-wider text-zinc-500">
                OFF-DUTY
              </span>
              <div className="flex flex-wrap gap-3">
                {offDuty.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-500"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#0071bc]" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </motion.article>
          </div>
        </section>

        {/* ─── Field Notes (Blog) ─── */}
        <section id="field-notes" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.34 }}
          >
            FIELD NOTES
          </motion.h2>
          <ul className="mt-6 space-y-4">
            {fieldNotes.map((note, i) => (
              <motion.li
                key={note.title}
                className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-4 transition-colors hover:border-[#0071bc]/30 sm:flex-row sm:items-center sm:justify-between sm:py-5"
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: 0.36 + i * 0.03 }}
              >
                <span className="font-medium text-white">{note.title}</span>
                <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                  <span className="rounded bg-zinc-800/80 px-2 py-1 text-[#0071bc]">
                    {note.readTime}
                  </span>
                  <span>{note.date}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* ─── Footer ─── */}
        <motion.footer
          className={`flex flex-col gap-10 border-t border-zinc-800 pt-16 ${SECTION}`}
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.44 }}
        >
          <div className="flex flex-wrap gap-6">
            <a
              href="https://www.linkedin.com/in/prathamsarin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href="mailto:pratham@example.com"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
            <a
              href="#field-notes"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Blog
            </a>
          </div>
          <p className="font-mono text-xs text-zinc-600">
            Built with Next.js & Tailwind. Deployed on Vercel.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
