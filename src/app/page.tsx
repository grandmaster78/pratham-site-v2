"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
  FileText,
  CreditCard,
  Code,
  Lightbulb,
  Target,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { CursorGlow } from "@/components/CursorGlow";
import { StickyNav } from "@/components/StickyNav";
import { ContactForm } from "@/components/ContactForm";
import { Image as PortfolioImage } from "@/components/Image";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const SECTION = "mt-24 sm:mt-32";

/* ─── Career Timeline ─── */
const timeline = [
  {
    period: "Aug 2022 – Present",
    title: "General Manager, IAM",
    company: "Amazon Advertising",
    type: "leadership" as const,
    description:
      "Single-threaded leader owning product, program, and engineering for Identity & Access Management. Systems enable 1M+ advertisers to manage all ad-spend in a single account with configurable permissions.",
    highlights: [
      "Own P&L across multi-functional teams",
      "Product + Engineering + Program leadership",
      "1M+ advertisers, configurable permissions at scale",
    ],
  },
  {
    period: "Mar 2021 – Aug 2022",
    title: "Principal Product Manager – Tech",
    company: "Amazon Advertising",
    type: "product" as const,
    description:
      "Defined multi-year Think Big vision. Delivered incremental milestones innovating on behalf of hundreds of thousands of advertisers, generating millions in annualized revenue.",
    highlights: [
      "Multi-year strategic product vision",
      "Millions in annualized revenue impact",
      "Hired and scaled PM and engineering teams",
    ],
  },
  {
    period: "Aug 2017 – Mar 2021",
    title: "Senior Product Manager – Tech",
    company: "Amazon Ads Core Services",
    type: "product" as const,
    description:
      "First PM role at Amazon. Built the foundation for Ads identity services, driving product strategy for core infrastructure that supports thousands of downstream developers.",
    highlights: [
      "Core Ads infrastructure PM",
      "99.999% availability services",
      "Thousands of downstream developer teams",
    ],
  },
  {
    period: "2016 – 2017",
    title: "MBA, Product Management & Entrepreneurship",
    company: "Cornell Johnson",
    type: "education" as const,
    description:
      "Merit Scholar. Big Red Venture Fund. High Tech Club. Won first prize in Leading Teams Case Competition. The strategic bridge between code and capital.",
    highlights: [
      "Big Red Venture Fund Associate",
      "Addepar: wireframes, user research, prototyping",
      "Tel Aviv: consulting startups raising VC",
    ],
  },
  {
    period: "Jun 2015 – Mar 2016",
    title: "Senior PM – Growth & Payments",
    company: "PayU (Naspers)",
    type: "product" as const,
    description:
      "Drove merchant acquisition and activation for India's leading payment processor. Increased annual GMV by $135M and onboarded India's top 8 merchants.",
    highlights: [
      "+$135M annual GMV",
      "Planned & executed $3M marketing budget",
      "1-tap payment launch",
    ],
  },
  {
    period: "Jun 2011 – Jun 2015",
    title: "Employee #7 → Product Manager",
    company: "HealthKart (Sequoia-backed Series C)",
    type: "founder" as const,
    description:
      "Joined when the business plan was on paper. Built healthkart.com from scratch as a senior engineer, then transitioned to PM. Grew the team from 7 to 450. Achieved $2.5M revenue at 10% operating profit within 6 months of launch.",
    highlights: [
      "Built the portal from scratch (Java, Spring, SQL)",
      "Conversion rate to ~8% via A/B testing",
      "NPS 37→55, 60:40 repeat:new order ratio",
      "Team growth: 7 → 450 people",
    ],
  },
  {
    period: "2007 – 2011",
    title: "B.Tech, Computer Science",
    company: "Thapar Institute of Engineering",
    type: "education" as const,
    description:
      "Founded 'Checkmate' chess club. Captained the team to 2 consecutive Inter-University Championship wins. IIT Delhi Summer Research Fellow.",
    highlights: [],
  },
];

/* ─── PM Thought Leadership Cards ─── */
const pmPillars = [
  {
    id: "vision",
    title: "Think Big Vision",
    description:
      "Define multi-year product strategy. Translate ambiguity into roadmaps with incremental milestones that compound into outsized outcomes.",
    icon: Lightbulb,
  },
  {
    id: "execution",
    title: "Relentless Execution",
    description:
      "Ship despite odds and ambiguity. Singular focus on customer outcomes—generating millions in annualized revenue across hundreds of thousands of advertisers.",
    icon: Target,
  },
  {
    id: "people",
    title: "People-First Leadership",
    description:
      "Build, hire, and scale high-performing cross-functional teams. Inner curiosity and creativity drive product, engineering, and program outcomes.",
    icon: Users,
  },
];

/* ─── Amazon Impact Cards ─── */
const amazonImpact = [
  {
    id: "iam",
    title: "Identity & Access Management",
    description:
      "1M+ advertisers manage all ad-spend in a single account with configurable permissions. End-to-end ownership of product, engineering, and program.",
    icon: Shield,
    stat: "1M+",
    statLabel: "advertisers",
  },
  {
    id: "scale",
    title: "Ads-Scale Infrastructure",
    description:
      "99.999% availability for identity services used by thousands of downstream developer teams across Amazon Advertising.",
    icon: Globe,
    stat: "99.999%",
    statLabel: "availability",
  },
  {
    id: "revenue",
    title: "Revenue & Growth",
    description:
      "Multi-year Think Big vision delivered through incremental milestones, generating millions in annualized revenue.",
    icon: TrendingUp,
    stat: "$M+",
    statLabel: "annual revenue",
  },
];

/* ─── Field Notes ─── */
const fieldNotes = [
  {
    title: "Why Agents Need a Registry",
    slug: "why-agents-need-a-registry",
    date: "Jan 2025",
    readTime: "5 min read",
  },
  {
    title: "VC Lessons for SDMs",
    slug: "vc-lessons-for-sdms",
    date: "Dec 2024",
    readTime: "5 min read",
  },
  {
    title: "Building Trust in Autonomous Workflows",
    slug: "building-trust-in-autonomous-workflows",
    date: "Nov 2024",
    readTime: "5 min read",
  },
];

/* ─── World View ─── */
const worldViewPhotos = [
  { id: "shanghai", label: "Shanghai", src: "https://picsum.photos/seed/shanghai/600/400" },
  { id: "london", label: "London", src: "https://picsum.photos/seed/london/600/400" },
  { id: "medellin", label: "Medellín", src: "https://picsum.photos/seed/medellin/600/400" },
];

/* ─── Off-duty ─── */
const offDuty = [
  { icon: Trophy, label: "Formula 1" },
  { icon: GlobeIcon, label: "Tennis" },
  { icon: GlobeIcon, label: "Shanghai" },
  { icon: GlobeIcon, label: "London" },
  { icon: GlobeIcon, label: "Medellín" },
  { icon: GlobeIcon, label: "Tel Aviv" },
];

const typeColors: Record<string, string> = {
  leadership: "border-[#0071bc]/50 text-[#0071bc]",
  product: "border-emerald-500/50 text-emerald-400",
  founder: "border-amber-500/50 text-amber-400",
  education: "border-violet-500/50 text-violet-400",
};

const typeLabels: Record<string, string> = {
  leadership: "LEADERSHIP",
  product: "PRODUCT",
  founder: "FOUNDER",
  education: "EDUCATION",
};

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

function m(reduceMotion: boolean | null, delay = 0) {
  if (reduceMotion) return {};
  return {
    ...fadeInUp,
    transition: { ...fadeInUp.transition, delay },
  };
}

export default function Home() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      <StickyNav />

      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <CursorGlow />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-12 sm:px-8 sm:pt-24 sm:pb-16 md:px-10">
        {/* ═══════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════ */}
        <motion.section
          id="hero"
          className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16"
          {...m(reduceMotion, 0)}
        >
          <div className="absolute right-0 top-0 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 font-mono text-xs text-zinc-500 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] pulse-dot" aria-hidden />
            Short Hills, NJ
          </div>

          <motion.div {...m(reduceMotion, 0.05)}>
            <div className="ring-2 ring-[#0071bc] ring-offset-4 rounded-full p-1 ring-offset-[#050505]">
              <ProfilePhoto />
            </div>
          </motion.div>

          <motion.div className="flex flex-col justify-center" {...m(reduceMotion, 0.08)}>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Pratham Sarin
            </h1>
            <p className="mt-3 text-lg text-zinc-500">
              General Manager, IAM @ Amazon Advertising
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-500">
              Single-threaded leader owning product, engineering, and program for
              Advertising Identity & Access Management. My biggest strength is the
              sheer ability to get things done, despite multiple odds and ambiguity.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm text-[#0071bc] transition-colors hover:text-[#0071bc]/80"
              >
                <FileText className="h-4 w-4" />
                View CV
              </a>
              <a
                href="#timeline"
                className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
              >
                View journey
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            PM THOUGHT LEADERSHIP
        ═══════════════════════════════════════════════ */}
        <section id="leadership" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.1)}
          >
            PRODUCT LEADERSHIP PHILOSOPHY
          </motion.h2>
          <motion.p
            className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-500"
            {...m(reduceMotion, 0.12)}
          >
            A singular focus on people, coupled with inner curiosity and creativity,
            drives me in all facets of life. From founding team engineer to General
            Manager—the constant is shipping what matters.
          </motion.p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pmPillars.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
                  {...m(reduceMotion, 0.14 + i * 0.04)}
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

        {/* ═══════════════════════════════════════════════
            AMAZON IMPACT
        ═══════════════════════════════════════════════ */}
        <section id="amazon" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.18)}
          >
            AMAZON ADVERTISING · 8+ YEARS
          </motion.h2>
          <motion.p
            className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-500"
            {...m(reduceMotion, 0.2)}
          >
            Sr. PM-T → Principal PM-T → General Manager. Progressed from building
            core Ads services to owning all of Identity & Access Management—product,
            engineering, and program for multi-functional teams.
          </motion.p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {amazonImpact.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
                  {...m(reduceMotion, 0.22 + i * 0.04)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-[#0071bc]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-white">{card.stat}</p>
                      <p className="font-mono text-xs text-zinc-600">{card.statLabel}</p>
                    </div>
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

        {/* ═══════════════════════════════════════════════
            CAREER TIMELINE
        ═══════════════════════════════════════════════ */}
        <section id="timeline" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.26)}
          >
            CAREER TIMELINE
          </motion.h2>

          <div className="relative mt-10">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800 sm:left-6" aria-hidden />

            <div className="space-y-8">
              {timeline.map((entry, i) => (
                <motion.div
                  key={i}
                  className="relative pl-12 sm:pl-16"
                  {...m(reduceMotion, 0.28 + i * 0.04)}
                >
                  {/* Dot on the line */}
                  <div className="absolute left-[11px] top-1 h-3 w-3 rounded-full border-2 border-zinc-700 bg-[#050505] sm:left-[19px]" />

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs text-zinc-600">
                        {entry.period}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider ${typeColors[entry.type]}`}
                      >
                        {typeLabels[entry.type]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {entry.title}
                    </h3>
                    <p className="font-mono text-sm text-[#0071bc]">
                      {entry.company}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                      {entry.description}
                    </p>
                    {entry.highlights.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {entry.highlights.map((h) => (
                          <li
                            key={h}
                            className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 font-mono text-[11px] text-zinc-500"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            AI AGENTS
        ═══════════════════════════════════════════════ */}
        <section id="agents" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.34)}
          >
            AI AGENTS · WHAT I BUILD
          </motion.h2>
          <motion.p
            className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-500"
            {...m(reduceMotion, 0.35)}
          >
            Shipping AI-powered tools that merge product thinking with real-time
            data. Each agent is a full-stack system — cloud infrastructure, live
            APIs, and a polished interface.
          </motion.p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <motion.a
              href="/analyst"
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-emerald-500/40 hover:bg-zinc-900/50 sm:p-8"
              {...m(reduceMotion, 0.36)}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 font-mono text-[10px] tracking-wider text-zinc-400 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-400">
                  <Code className="h-3 w-3" />
                  LIVE
                </div>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                Institutional Earnings Strategist
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                AI-powered financial terminal that fetches live SEC filing data,
                renders QoQ revenue and net income charts, and generates a
                morning-briefing memo with a BUY/SELL verdict — powered by Claude
                3.5 Sonnet on Amazon Bedrock.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Next.js", "AWS Lambda", "Amazon Bedrock", "Claude 3.5", "FMP API", "Recharts"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 font-mono text-[11px] text-zinc-500"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-emerald-400 transition-colors group-hover:text-emerald-300">
                Launch Dashboard
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.a>

            <motion.a
              href="/ads-optimizer"
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-[#FF9900]/40 hover:bg-zinc-900/50 sm:p-8"
              {...m(reduceMotion, 0.38)}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF9900]/30 bg-[#FF9900]/10">
                  <Target className="h-6 w-6 text-[#FF9900]" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 font-mono text-[10px] tracking-wider text-zinc-400 transition-colors group-hover:border-[#FF9900]/30 group-hover:text-[#FF9900]">
                  <Code className="h-3 w-3" />
                  LIVE
                </div>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                Amazon Ads Optimizer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Agentic campaign optimizer that connects to the Amazon Ads MCP
                Server, lists your accounts and campaigns, and uses Claude on
                Bedrock to recommend bid and budget optimizations in real time.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Amazon Ads MCP", "Login with Amazon", "Bedrock", "Claude 3.5", "MCP SDK", "Streaming"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 font-mono text-[11px] text-zinc-500"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-[#FF9900] transition-colors group-hover:text-[#FF9900]/80">
                Launch Optimizer
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            PERSONAL BENTO
        ═══════════════════════════════════════════════ */}
        <section id="personal" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.38)}
          >
            BEYOND THE BUILD
          </motion.h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <motion.article
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:col-span-2 sm:p-8"
              {...m(reduceMotion, 0.4)}
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

            <motion.article
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:p-8"
              {...m(reduceMotion, 0.42)}
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

            <motion.article
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-[#0071bc]/30 sm:col-span-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-8"
              {...m(reduceMotion, 0.44)}
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

        {/* ═══════════════════════════════════════════════
            WORLD VIEW
        ═══════════════════════════════════════════════ */}
        <section className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.46)}
          >
            WORLD VIEW
          </motion.h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {worldViewPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                className="overflow-hidden rounded-xl"
                {...m(reduceMotion, 0.48 + i * 0.02)}
              >
                <div className="overflow-hidden rounded-xl border border-zinc-800 transition-colors hover:border-[#0071bc]/30">
                  <PortfolioImage
                    src={photo.src}
                    alt={photo.label}
                    width={600}
                    height={400}
                    className="h-48 w-full object-cover sm:h-56"
                  />
                  <p className="bg-zinc-900/80 px-4 py-2 font-mono text-xs text-zinc-500">
                    {photo.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            FIELD NOTES
        ═══════════════════════════════════════════════ */}
        <section id="field-notes" className={SECTION}>
          <motion.h2
            className="font-mono text-xs font-medium tracking-wider text-zinc-500"
            {...m(reduceMotion, 0.5)}
          >
            FIELD NOTES
          </motion.h2>
          <ul className="mt-6 space-y-4">
            {fieldNotes.map((note, i) => (
              <motion.li key={note.slug} {...m(reduceMotion, 0.52 + i * 0.03)}>
                <a
                  href={`/blog/${note.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-4 transition-colors hover:border-[#0071bc]/30 sm:flex-row sm:items-center sm:justify-between sm:py-5"
                >
                  <span className="font-medium text-white">{note.title}</span>
                  <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                    <span className="rounded bg-zinc-800/80 px-2 py-1 text-[#0071bc]">
                      {note.readTime}
                    </span>
                    <span>{note.date}</span>
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* ═══════════════════════════════════════════════
            CONTACT
        ═══════════════════════════════════════════════ */}
        <section id="contact" className={SECTION}>
          <motion.div
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8"
            {...m(reduceMotion, 0.56)}
          >
            <h2 className="font-mono text-xs font-medium tracking-wider text-zinc-500">
              GET IN TOUCH
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
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
                  href="/blog"
                  className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  Blog
                </a>
              </div>
              <div className="max-w-md">
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════ */}
        <motion.footer
          className={`flex flex-col gap-10 border-t border-zinc-800 pt-16 ${SECTION}`}
          {...m(reduceMotion, 0.58)}
        >
          <p className="font-mono text-xs text-zinc-600">
            Built with Next.js & Tailwind. Deployed on Vercel.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
