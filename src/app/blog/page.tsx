import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Field Notes | Pratham Sarin",
  description:
    "Product and technical leadership perspectives on agentic auth, VC strategy for operators, and building trust at scale.",
};

const posts = [
  {
    slug: "why-agents-need-a-registry",
    title: "Why Agents Need a Registry",
    excerpt:
      "As AI agents proliferate, the PM challenge is defining the right abstraction layer for autonomous identity. The companies that build it first will own the trust layer of the agentic era.",
    date: "Jan 2025",
    readTime: "5 min read",
  },
  {
    slug: "vc-lessons-for-sdms",
    title: "VC Lessons for SDMs",
    excerpt:
      "Portfolio thinking, market timing, and founder-market fit—how the Big Red Venture Fund lens makes you a better GM at Amazon.",
    date: "Dec 2024",
    readTime: "5 min read",
  },
  {
    slug: "building-trust-in-autonomous-workflows",
    title: "Building Trust in Autonomous Workflows",
    excerpt:
      "When AI agents manage millions in ad-spend, trust isn't optional—it's the product. Designing least-privilege authorization at machine speed.",
    date: "Nov 2024",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-8 sm:py-24">
        <Link
          href="/#field-notes"
          className="mb-12 inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Field Notes
        </h1>
        <p className="mt-3 text-zinc-500">
          Product and technical leadership perspectives from the intersection of
          identity infrastructure, agentic auth, and venture strategy.
        </p>

        <ul className="mt-16 space-y-12">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="border-b border-zinc-800 pb-12 last:border-0"
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="text-xl font-semibold text-white transition-colors group-hover:text-[#0071bc] sm:text-2xl">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex gap-4 font-mono text-xs text-zinc-500">
                  <span className="rounded bg-zinc-800/80 px-2 py-1 text-[#0071bc]">
                    {post.readTime}
                  </span>
                  <span>{post.date}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
