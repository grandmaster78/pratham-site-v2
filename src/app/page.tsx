"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Shield,
  MapPin,
  Linkedin,
  Flame,
  TrendingUp,
  Zap,
  Home as HomeIcon,
  Globe,
  Watch,
  Trophy,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const SECTION_GAP = "mt-[var(--space-section)]";
const BLOCK_GAP = "mt-[var(--space-block)]";

/* Experience Bento - 4 cards */
const experienceCards: Array<{
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
  badges?: Array<{ icon: React.ComponentType<{ className?: string }>; label: string }>;
}> = [
  {
    id: "healthkart",
    label: "FOUNDER GRIT",
    title: "HealthKart",
    description:
      "Employee #1. Built the e-commerce engine from zero to India's largest health platform—inventory, payments, logistics from scratch.",
    icon: Briefcase,
    delay: 0.08,
  },
  {
    id: "cornell",
    label: "THE STRATEGY",
    title: "Cornell MBA",
    description:
      "Merit Scholar, BR Venture Fund Associate. The Strategic Bridge between code and capital—VC strategy meets deep-tech execution.",
    icon: GraduationCap,
    delay: 0.12,
  },
  {
    id: "amazon",
    label: "THE SCALE",
    title: "Amazon AI",
    description:
      "Sr. SDM, AI Builder Infrastructure. Leading Identity & Auth for AI Agents. Evolved from Sr. PMT—driving agentic auth at global scale.",
    icon: Shield,
    delay: 0.16,
  },
  {
    id: "personal",
    label: "LIFE",
    title: "NYC / NJ",
    description:
      "Father of two daughters in Short Hills. Fan of Indian cuisine, Formula 1, and horology.",
    icon: HomeIcon,
    delay: 0.2,
    badges: [
      { icon: Trophy, label: "F1" },
      { icon: Watch, label: "Horology" },
    ],
  },
];

/* Field Notes - Agentic Auth blog cards */
const fieldNotesPosts = [
  {
    id: "session-token",
    title: "The Death of the Session Token?",
    excerpt:
      "Why M2M auth demands a new paradigm for stateful agent sessions.",
    readTime: "5 min read",
    date: "Jan 2025",
  },
  {
    id: "trust",
    title: "Building Trust in Autonomous Workflows",
    excerpt:
      "Trust signals, attestation, and policy enforcement for agentic systems.",
    readTime: "6 min read",
    date: "Dec 2024",
  },
];

/* World View - travel gallery */
const worldViewImages = [
  { id: "shanghai", label: "Shanghai, China" },
  { id: "medellin", label: "Medellín, Colombia" },
  { id: "london", label: "London, UK" },
];

/* Values Footer */
const valuesFooter = [
  {
    id: "founder",
    title: "Founder Grit",
    icon: Flame,
    description: "0-to-1 mindset, building with constraints.",
  },
  {
    id: "vc",
    title: "VC Strategy",
    icon: TrendingUp,
    description: "Capital allocation, market positioning, growth moats.",
  },
  {
    id: "scale",
    title: "Amazon Scale",
    icon: Zap,
    description: "99.999% availability, operational excellence.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans">
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background: "var(--radial-glow)",
          backgroundAttachment: "fixed",
        }}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24 md:px-10">
        {/* ─── Hero ─── */}
        <motion.section
          id="hero"
          className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12 md:p-16"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0 }}
        >
          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 font-mono text-xs text-zinc-400 backdrop-blur-sm sm:right-8 sm:top-8">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] pulse-dot" aria-hidden />
            Currently: NYC / NJ
          </div>
          <span className="font-mono text-sm tracking-wider text-zinc-500">
            PRATHAM SARIN
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Architecting AI Builder Infrastructure at Amazon Scale.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Bridging the grit of a 0-to-1 founder with the precision of
            global-scale AI systems.
          </p>
        </motion.section>

        {/* ─── Experience Bento ─── */}
        <section className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 ${SECTION_GAP}`}>
          {experienceCards.map((card) => {
            const Icon = card.icon;
            const badges = card.badges ?? [];
            return (
              <motion.article
                key={card.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#0071bc]/40 sm:p-8"
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: card.delay }}
              >
                <span className="font-mono text-xs tracking-wider text-zinc-500">
                  {card.label}
                </span>
                <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-[#0071bc]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-white sm:text-xl">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {card.description}
                </p>
                {badges.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((b) => {
                      const BadgeIcon = b.icon;
                      return (
                        <span
                          key={b.label}
                          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2 py-1 font-mono text-xs text-zinc-400"
                        >
                          <BadgeIcon className="h-3 w-3 text-[#0071bc]" />
                          {b.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </motion.article>
            );
          })}
        </section>

        {/* ─── Field Notes on Agentic Auth ─── */}
        <section id="field-notes" className={SECTION_GAP}>
          <motion.h2
            className="font-mono text-xs tracking-wider text-[#0071bc]"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.22 }}
          >
            FIELD NOTES ON AGENTIC AUTH
          </motion.h2>
          <div className={`mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 ${BLOCK_GAP}`}>
            {fieldNotesPosts.map((post, i) => (
              <motion.article
                key={post.id}
                className="blog-card overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#0071bc]/40 sm:p-8"
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: 0.24 + i * 0.04 }}
              >
                <h3 className="text-xl font-semibold text-white sm:text-2xl">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-3 font-mono text-xs text-zinc-500">
                  <span className="rounded bg-zinc-800/80 px-2 py-1 text-[#0071bc]">
                    {post.readTime}
                  </span>
                  <span>{post.date}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ─── World View ─── */}
        <section id="world-view" className={SECTION_GAP}>
          <motion.h2
            className="font-mono text-xs tracking-wider text-[#0071bc]"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            WORLD VIEW
          </motion.h2>
          <div className={`mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 ${BLOCK_GAP}`}>
            {worldViewImages.map((img, i) => (
              <motion.div
                key={img.id}
                className="group overflow-hidden rounded-xl border border-zinc-800 transition-colors hover:border-[#0071bc]/40"
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: 0.32 + i * 0.03 }}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
                  <div className="flex h-full w-full flex-col items-end justify-end gap-1 bg-gradient-to-br from-zinc-800 to-zinc-950 p-5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-zinc-500" aria-hidden />
                      <span className="font-mono text-sm text-zinc-500">
                        {img.label}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Values Footer ─── */}
        <motion.footer
          className={`flex flex-col gap-12 border-t border-zinc-800 pt-16 ${SECTION_GAP}`}
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.38 }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {valuesFooter.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-[#0071bc]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-center justify-between gap-6 border-t border-zinc-800/50 pt-12 sm:flex-row sm:items-center">
            <a
              href="https://www.linkedin.com/in/prathamsarin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-400 transition-colors hover:text-[#0071bc]"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 font-mono text-xs text-zinc-500">
              <MapPin className="h-3.5 w-3.5" />
              NYC / NJ
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
