"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EdgeCornerFrame } from "@/components/ui/edge-corner-frame";
import { TextReveal } from "@/components/ui/text-reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/registry";

  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createClient(), []);

  // Quick 1-click Demo Sign In
  const handleQuickDemoSignIn = async () => {
    setIsDemoLoading(true);
    setErrorMessage(null);
    setEmail("registrar@arcfield.systems");
    setPassword("ArcfieldAdmin2026!");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "registrar@arcfield.systems",
        password: "ArcfieldAdmin2026!",
      });

      if (error) {
        setErrorMessage(error.message);
        setIsDemoLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMessage("Authenticated as Lead Registrar. Entering Registry...");
        setTimeout(() => {
          router.push(nextUrl);
          router.refresh();
        }, 350);
      }
    } catch {
      setErrorMessage("Authentication failed. Please verify network connection.");
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both institutional email and password.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMessage("Authentication successful. Redirecting to Registry...");
          setTimeout(() => {
            router.push(nextUrl);
            router.refresh();
          }, 300);
        }
      } else {
        // Sign Up Mode
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              firstName: firstName.trim() || "Staff",
              lastName: lastName.trim() || "Member",
              role: "REGISTRAR",
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMessage("Account created successfully. Entering Registry...");
          setTimeout(() => {
            router.push(nextUrl);
            router.refresh();
          }, 350);
        } else {
          setSuccessMessage(
            "Account registered. Please verify your email or use the demo login."
          );
          setIsLoading(false);
        }
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 relative select-none">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group hover:opacity-85 transition-opacity"
            title="Arcfield Systems"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              A
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-white uppercase">
                ARCFIELD
              </span>
              <span className="text-zinc-300 dark:text-zinc-800">/</span>
              <span className="text-xs text-zinc-500 font-medium">Gateway</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Authentication Viewport */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Cardless Frame with Pre-Rendered Edge Corner Shadows */}
          <EdgeCornerFrame isFocused={isFocused}>
            {/* Header Badge & Title */}
            <div className="text-center mb-8">
              <TextReveal delay={0.06} className="inline-block mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wide bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-300/40 dark:border-zinc-700/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>SECURE_GATEWAY · v2.4</span>
                </div>
              </TextReveal>
              <TextReveal
                as="h1"
                delay={0.18}
                className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Institutional Authentication
              </TextReveal>
              <TextReveal
                as="p"
                delay={0.32}
                className="text-xs text-zinc-500 dark:text-zinc-400 mt-1"
              >
                Academic records database & student lifecycle management
              </TextReveal>
            </div>

            {/* Mode Switcher Pills (Fluid spring transition) */}
            <TextReveal delay={0.46}>
              <div className="flex p-1 mb-6 rounded-lg bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-300/40 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage(null);
                  }}
                  className={`tap-target flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    mode === "signin"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                  }}
                  className={`tap-target flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Register Staff
                </button>
              </div>
            </TextReveal>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-modal-enter">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-modal-enter">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Lead"
                        required
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                      />
                      <User className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Registrar"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@arcfield.systems"
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors text-zinc-900 dark:text-zinc-100"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={8}
                    className="w-full pl-8 pr-9 py-2 text-xs rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors text-zinc-900 dark:text-zinc-100"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isDemoLoading}
                className="tap-target w-full mt-2 py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin"
                        ? "Sign In to Registry"
                        : "Create Institutional Account"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Evaluation Shortcut
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Role: Lead Registrar
                </span>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                disabled={isLoading || isDemoLoading}
                className="tap-target w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">One-Click Lead Registrar Sign In</span>
                </div>
                {isDemoLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500 shrink-0" />
                ) : (
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                    Auto-Fill ↵
                  </span>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center mt-2 font-mono">
                registrar@arcfield.systems · ArcfieldAdmin2026!
              </p>
            </div>
          </EdgeCornerFrame>

          {/* Institutional Compliance Footer */}
          <div className="text-center mt-6 text-[11px] text-zinc-400 font-mono tracking-tight">
            TLS 1.3 · Supabase Auth · Zero-Knowledge Database · FERPA Aligned
          </div>
        </div>
      </main>

      {/* Bottom spacer */}
      <footer className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#050507]">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
