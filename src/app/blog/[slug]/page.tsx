import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const posts: Record<
  string,
  { title: string; date: string; readTime: string; content: string }
> = {
  "why-agents-need-a-registry": {
    title: "Why Agents Need a Registry",
    date: "Jan 2025",
    readTime: "5 min read",
    content: `As AI agents proliferate across enterprise systems, a fundamental question emerges: how do we know who—or what—is acting on whose behalf?

At Amazon Advertising, our IAM systems already serve 1M+ advertisers with configurable permissions. But the paradigm is shifting. When autonomous agents execute multi-step workflows, traditional session-based auth breaks down. You can't issue a cookie to an LLM.

The Agent Registry solves this by providing a canonical source of truth for autonomous builder identities. Every agent gets verifiable identity, capability attestation, and trust signals that propagate across the ecosystem.

This isn't just a technical problem—it's a product problem. The PM challenge is defining the right abstraction layer: enough flexibility for diverse agent architectures, enough rigor for enterprise-grade security.

From my years building Ads identity infrastructure, the lesson is clear: identity is the foundation. Get it right, and everything downstream—authorization, audit, revocation—becomes tractable. Get it wrong, and you're retrofitting trust into a system that was never designed for it.

The companies that build robust agent registries first will own the trust layer of the agentic era. That's the bet we're making.`,
  },
  "vc-lessons-for-sdms": {
    title: "VC Lessons for SDMs",
    date: "Dec 2024",
    readTime: "5 min read",
    content: `My time at Cornell Johnson and the Big Red Venture Fund gave me a lens that I use every day as a General Manager at Amazon.

Portfolio thinking is real. As a GM owning product, engineering, and program, I'm constantly allocating resources across bets. Not every initiative will ship. Not every feature will land. The discipline is knowing when to double down and when to cut.

Market timing translates directly to roadmap prioritization. At PayU, we launched 1-tap payments at exactly the right moment—India's merchant ecosystem was ready, and we onboarded the top 8 merchants, adding $135M in annual GMV. Timing wasn't luck; it was pattern recognition.

Founder-market fit maps to team-problem fit. At HealthKart, I watched our team of 7 grow to 450 because we had the right people obsessing over the right problem. At Amazon, hiring is the single highest-leverage activity. The wrong PM on the wrong problem wastes months.

The Think Big mechanism at Amazon is essentially a pitch deck with operational rigor. Define the customer, size the opportunity, articulate the moat. The VC lens makes you a better operator because it forces clarity on why this, why now, why us.

The bridge between code and capital isn't abstract—it's the daily practice of building things that matter and measuring whether they do.`,
  },
  "building-trust-in-autonomous-workflows": {
    title: "Building Trust in Autonomous Workflows",
    date: "Nov 2024",
    readTime: "5 min read",
    content: `When AI agents act on behalf of advertisers managing millions in ad-spend, trust isn't optional—it's the product.

Our IAM systems at Amazon Ads handle identity and access for 1M+ advertisers. Every permission, every role binding, every audit trail exists because trust must be verifiable at scale. Now apply that to agents that make autonomous decisions in multi-step workflows.

The Session Service we're building addresses three critical dimensions: lifecycle management (how long can an agent act?), scoping (what can it access?), and revocation (how fast can we shut it down?).

From a product perspective, the challenge is designing for least-privilege without creating friction that kills adoption. At HealthKart, I learned that conversion optimization is about removing barriers while maintaining trust. The same principle applies to agent authorization: make the secure path the easy path.

Fine-grained authorization for LLM-driven actions requires a new mental model. Traditional RBAC was designed for humans clicking buttons. Agents operate at machine speed across service boundaries. Policy enforcement must be equally fast and equally expressive.

The companies that solve trust in autonomous workflows will unlock the next wave of enterprise AI adoption. The ones that don't will find their agents revoked, their customers churned, and their competitive moat eroded.

This is the product problem I wake up thinking about.`,
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | Pratham Sarin`,
    description: post.content.slice(0, 160),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-zinc-500">Post not found.</p>
      </div>
    );
  }

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

      <article className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-8 sm:py-24">
        <Link
          href="/blog"
          className="mb-12 inline-flex items-center gap-2 font-mono text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Field Notes
        </Link>

        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex gap-4 font-mono text-xs text-zinc-500">
            <span className="rounded bg-zinc-800/80 px-2 py-1 text-[#0071bc]">
              {post.readTime}
            </span>
            <span>{post.date}</span>
          </div>
        </header>

        <div className="mt-12 space-y-6 text-base leading-relaxed text-zinc-400">
          {post.content
            .trim()
            .split("\n\n")
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </article>
    </div>
  );
}
