"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlowHorizonDemo from "@/components/ui/glow-horizon-demo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-white selection:bg-purple-900/40">
      {/* Top Institutional Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#050507]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 rounded-md bg-white text-zinc-950 font-mono font-bold text-xs flex items-center justify-center">
              A
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="font-semibold text-white tracking-tight">ARCFIELD</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">Registry</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <span>Launch Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with Glow Horizon & Animated Title */}
      <main className="flex-1">
        <GlowHorizonDemo
          onExploreClick={() => router.push("/")}
          onEnrollClick={() => router.push("/?enroll=true")}
        />

        {/* Institutional Architecture Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 block mb-2">
              Architecture Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Institutional Academic Engine
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Built for high-concurrency university registrars and academic divisions with immutable audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Immutable Audit Trail</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every record change, enrollment event, and archival action is captured in cryptographic historical logs with actor IDs and timestamp tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Sub-Millisecond Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Compound database indexing, sliding-window rate limiting, and Turbopack SSR deliver instant search across thousands of active candidate profiles.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Lifecycle Protection</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dual-tier lifecycle safeguards active student records against accidental data loss with soft-archival preservation and one-click instantaneous restoration.
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-12 p-6 rounded-2xl border border-white/8 bg-white/[0.015] flex flex-wrap items-center justify-around gap-6 text-center">
            <div>
              <div className="text-2xl font-bold font-mono text-white">100%</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase mt-1">Audit Verification</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold font-mono text-white">&lt; 10ms</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase mt-1">Query Latency</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold font-mono text-white">120 FPS</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase mt-1">Compositor Motion</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ARCFIELD SYSTEMS · SMS REGISTRY PLATFORM</span>
          <Link href="/" className="hover:text-white transition-colors underline underline-offset-2">
            Enter Live Student Directory →
          </Link>
        </div>
      </footer>
    </div>
  );
}
