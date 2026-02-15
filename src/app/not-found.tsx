import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white flex flex-col items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 text-center">
        <p className="font-mono text-4xl font-semibold text-zinc-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-3 font-mono text-sm text-zinc-400 transition-colors hover:border-[#0071bc]/40 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
