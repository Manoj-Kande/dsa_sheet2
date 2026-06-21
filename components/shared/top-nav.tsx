"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Search, Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { CommandPalette } from "./command-palette";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/daily-target", label: "Daily Target" },
  { href: "/topics", label: "Roadmap" },
  { href: "/problems", label: "Problems" },
  { href: "/companies", label: "Companies" },
  { href: "/sheets", label: "Sheets" },
  { href: "/bookmarks", label: "Bookmarks" },
];

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const mobileMenuId = useId();

  // Close the mobile menu whenever the route changes (link click already
  // closes it directly, but this also covers back/forward navigation).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 h-14 border-b border-border-default bg-bg-base/80 backdrop-blur-md">
        <div className="max-w-350 mx-auto h-full px-6 flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg shrink-0"
          >
            <span className="w-6 h-6 rounded-md bg-linear-to-br from-accent to-easy grid place-items-center text-bg-base font-extrabold text-[13px]">
              IO
            </span>
            <span>InterviewOS</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1 flex-1"
            aria-label="Primary"
          >
            {LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-text-primary bg-bg-surface"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <button
              onClick={() => setCmdkOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border-default rounded-md text-text-tertiary text-sm min-w-40 sm:min-w-50 hover:border-border-strong hover:bg-bg-elevated transition-colors"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline flex-1 text-left">
                Search problems…
              </span>
              <span className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.5 bg-bg-elevated border border-border-default rounded">
                ⌘K
              </span>
            </button>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>

            <button
              className="md:hidden p-2 rounded-md text-text-primary hover:bg-bg-subtle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls={mobileMenuId}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            id={mobileMenuId}
            className="md:hidden border-t border-border-default px-4 py-2"
          >
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} />
    </>
  );
}
