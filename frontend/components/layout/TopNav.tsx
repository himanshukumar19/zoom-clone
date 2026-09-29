"use client";

import Link from "next/link";
import { getCurrentUser } from "@/lib/api";
import { Wordmark } from "@/components/Wordmark";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  name: string;
}

// Static placeholder user (no auth). The real data comes from /api/me.
const PLACEHOLDER_AVATAR_URL = "/default-user-avatar.svg";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch the default user (id=1) – no login required.
  useEffect(() => {
    async function fetchDefaultUser() {
      try {
        const data = await getCurrentUser();
        setUser({ name: data.name });
      } catch {
        // Fallback placeholder.
        setUser({ name: "User" });
      } finally {
        setLoading(false);
      }
    }

    fetchDefaultUser();
  }, []);

  if (loading) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-white px-4 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-6 w-16 rounded bg-line/40 animate-pulse" />
          <div className="hidden h-5 w-px bg-line md:block" />
          <div className="hidden h-4 w-20 rounded bg-line/40 animate-pulse md:block" />
        </div>
        <div className="flex-1 hidden md:block max-w-sm mx-auto">
          <div className="h-9 rounded-full bg-line/30 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-line/40 animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-line/40 animate-pulse" />
        </div>
      </nav>
    );
  }

  const initials = getInitials(user?.name || "U");

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-white px-4 gap-4">
      {/* Left: Wordmark + divider + "Workplace" label */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue rounded"
        >
          <Wordmark compact />
          <span
            className="hidden h-5 w-px bg-line md:block"
            aria-hidden="true"
          />
          <span className="hidden text-sm font-medium text-muted md:block">
            Workplace
          </span>
        </Link>
      </div>

      {/* Center: Search pill — matches Zoom reference */}
      <div className="hidden flex-1 items-center justify-center md:flex max-w-sm mx-auto">
        <button
          aria-label="Search"
          className="flex w-full items-center gap-2.5 rounded-full border border-line bg-app px-4 py-2 text-sm text-muted/70 hover:border-zoom-blue/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-left flex-1">Search</span>
          <span className="hidden text-[10px] text-muted/50 sm:block font-medium">
            ⌘ K
          </span>
        </button>
      </div>

      {/* Right: Bell + Avatar dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Bell */}
        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-app hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar with initials fallback + static dropdown */}
        <div className="relative group">
          <button
            aria-label="Account menu"
            className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
          >
            {!avatarError ? (
              <img
                src={PLACEHOLDER_AVATAR_URL}
                alt={user?.name || "User"}
                className="h-9 w-9 rounded-full border border-line object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zoom-blue text-white text-sm font-bold select-none">
                {initials}
              </span>
            )}
          </button>

          {/* Static placeholder dropdown — no auth items */}
          <div className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-xl border border-line bg-white py-2 shadow-lg opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
            <div className="px-4 py-2 border-b border-line">
              <p className="text-xs text-muted">Signed in as</p>
              <p className="text-sm font-semibold text-ink truncate">
                {user?.name}
              </p>
            </div>
            <button className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-app transition-colors">
              Profile
            </button>
            <button className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-app transition-colors">
              Settings
            </button>
            <button className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-app transition-colors">
              Help
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}