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
  Database,
  Clock,
  Lock,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const careerItems = [
  {
    id: "amazon",
    label: "PRESENT",
    title: "Amazon",
    role: "Sr. SDM · AI Builder Infrastructure",
    description:
      "Leading Identity & Authorization for AI Agents. Evolved from Sr. PMT to Senior SDM—driving the technical and organizational strategy for agentic auth at scale.",
    icon: Shield,
    delay: 0.1,
    span: "sm:col-span-2",
  },
  {
    id: "healthkart",
    label: "FOUNDER ERA",
    title: "HealthKart",
    role: "Employee #1",
    description:
      "Built the e-commerce engine from absolute zero to India's leader. Founder Grit in action—inventory, payments, logistics, and growth from scratch.",
    icon: Briefcase,
    delay: 0.15,
    span: "sm:col-span-1",
  },
  {
    id: "cornell",
    label: "THE STRATEGY",
    title: "Cornell Johnson",
    role: "MBA & Merit Scholar · BR Venture Fund Associate",
    description:
      "Bridging VC strategy with deep-tech execution. Market positioning, capital allocation, and the lens to back builders who scale.",
    icon: GraduationCap,
    delay: 0.2,
    span: "sm:col-span-1",
  },
];

const agenticPillars = [
  {
    id: "registry",
    title: "Agent Registry",
    description:
      "Source of truth for autonomous builder identities. Enables discovery, trust signals, and capability attestation across the agent ecosystem.",
    icon: Database,
  },
  {
    id: "session",
    title: "Session Service",
    description:
      "State management for multi-step agentic tasks. Lifecycle, scoping, and revocation—ensuring least-privilege and audit trails at scale.",
    icon: Clock,
  },
  {
    id: "authz",
    title: "AuthZ at Scale",
    description:
      "Fine-grained authorization for LLM-driven actions. Policy enforcement, role bindings, and secure multi-tenant agent orchestration.",
    icon: Lock,
  },
];

const valuesItems = [
  {
    id: "founder",
    title: "Founder Grit",
    description:
      "0-to-1 mindset, building with constraints. Shipping when resources are slim and wearing every hat.",
    icon: Flame,
  },
  {
    id: "vc",
    title: "VC Strategy",
    description:
      "Capital allocation, market positioning, and growth moats. Thinking in bets and backing builders.",
    icon: TrendingUp,
  },
  {
    id: "scale",
    title: "Amazon Scale",
    description:
      "Operational excellence, 99.999% availability, and leadership principles. Systems that serve billions.",
    icon: Zap,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans">
      {/* Grid overlay - faint 15% opacity lines */}
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

      {/* Radial gradient behind hero */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background: "var(--radial-glow)",
          backgroundAttachment: "fixed",
        }}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20 md:px-10">
        {/* Hero Section */}
        <motion.section
          id="hero"
          className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-10 md:p-12"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0 }}
        >
          {/* Location badge - top right */}
          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 font-mono text-xs text-zinc-400 backdrop-blur-sm sm:right-8 sm:top-8">
            <span
              className="h-2 w-2 rounded-full bg-[#22c55e] pulse-dot"
              aria-hidden
            />
            Currently: NYC / NJ
          </div>

          <span className="font-mono text-sm tracking-wider text-zinc-500">
            PRATHAM SARIN
          </span>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Architecting AI Builder Infrastructure at Amazon Scale.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-400">
            Bridging the grit of a 0-to-1 founder with the precision of
            global-scale AI systems.
          </p>
        </motion.section>

        {/* Agentic Auth Block */}
        <motion.section
          id="agentic"
          className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:mt-8 sm:p-10"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.05 }}
        >
          <h2 className="font-mono text-xs tracking-wider text-[#0071bc]">
            TECHNICAL DEEP DIVE
          </h2>
          <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Securing the Last Mile: Agentic Identity & Auth.
          </h3>
          <p className="mt-4 max-w-3xl text-zinc-400 leading-relaxed">
            The focus is shifting from{" "}
            <span className="font-medium text-zinc-300">
              human-to-machine auth
            </span>{" "}
            to{" "}
            <span className="font-medium text-zinc-300">
              machine-to-machine (M2M) autonomous workflows
            </span>
            . AI agents acting on behalf of users require verifiable identity,
            scoped access, and auditable lifecycle management.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {agenticPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-[#0071bc]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 font-mono text-sm font-medium text-[#0071bc]">
                    {pillar.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Career Bento Grid */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-6">
          {careerItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.id}
                className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#0071bc]/40 ${item.span}`}
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: item.delay }}
              >
                <span className="font-mono text-xs tracking-wider text-zinc-500">
                  {item.label}
                </span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-[#0071bc]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-1 font-mono text-sm text-[#0071bc]">
                  {item.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </section>

        {/* Values & Principles */}
        <section className="mt-6 sm:mt-8">
          <motion.span
            className="font-mono text-xs tracking-wider text-zinc-500"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.25 }}
          >
            VALUES & PRINCIPLES
          </motion.span>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {valuesItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#0071bc]/40 sm:p-8"
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{
                    ...fadeInUp.transition,
                    delay: 0.25 + (i + 1) * 0.05,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-[#0071bc]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-zinc-800 pt-12 sm:flex-row sm:items-center"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.35 }}
        >
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
        </motion.footer>
      </main>
    </div>
  );
}
