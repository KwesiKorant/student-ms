"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, LogOut, LogIn, ShieldCheck, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";

interface HeaderProps {
  onOpenEnrollModal?: () => void;
  showEnrollButton?: boolean;
}

export function Header({ onOpenEnrollModal, showEnrollButton = false }: HeaderProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        const role =
          (user.app_metadata?.role as string) ||
          (user.user_metadata?.role as string) ||
          "Staff";
        setUserRole(role);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null);
        const role =
          (session.user.app_metadata?.role as string) ||
          (session.user.user_metadata?.role as string) ||
          "Staff";
        setUserRole(role);
      } else {
        setUserEmail(null);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close menu on click outside or Escape
  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserRole(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Brand Identity with Link to Landing */}
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-opacity"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 font-mono font-bold text-xs shadow-xs tracking-tighter">
              A
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
                ARCFIELD
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Registry
              </span>
            </div>
          </Link>

          {/* Center spacer / clean breathing room */}
          <div className="flex-1" />

          {/* Right: Actions, Auth Profile Menu & Theme Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />

            {/* Vertically Expanding User Profile Menu Dock */}
            {userEmail ? (
              <div className="relative inline-flex items-center" ref={menuRef}>
                <Tooltip
                  disabled={isMenuOpen}
                  content={`Signed in as ${userEmail}`}
                  subContent="Click to view session details or sign out"
                  side="bottom"
                >
                  <motion.button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    aria-expanded={isMenuOpen}
                    aria-label="User account menu"
                    className="tap-target group flex items-center justify-center h-9 w-9 rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900 backdrop-blur-md dark:backdrop-blur-none shadow-xs dark:shadow-[0_4px_8px_-2px_rgba(255,255,255,0.03)] hover:border-zinc-300 dark:hover:border-white/20 transition-colors cursor-pointer select-none"
                  >
                    <User className="w-4 h-4 text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                  </motion.button>
                </Tooltip>

                {/* Vertically Expanding Floating Profile Dock Card */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      key="profile-menu-dock"
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 28,
                      }}
                      className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] z-50 rounded-2xl shadow-2xl dark:shadow-[0_10px_20px_-4px_rgba(255,255,255,0.04),0_4px_8px_-2px_rgba(255,255,255,0.02),0_16px_32px_rgba(0,0,0,0.8)] bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/15 p-3.5 space-y-3 text-xs"
                    >
                      {/* Identity Header */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                            Active Session
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        </div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-xs" title={userEmail}>
                          {userEmail}
                        </div>
                        {userRole && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              {userRole}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-zinc-100 dark:border-t dark:border-white/5" />

                      {/* Standard-Color Visible Logout Button */}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="tap-target w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/40 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Arcfield</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Enroll Student Button (Optional in Navbar, Can also live in Hero) */}
            {showEnrollButton && onOpenEnrollModal && (
              <button
                type="button"
                onClick={onOpenEnrollModal}
                className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll Student</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
