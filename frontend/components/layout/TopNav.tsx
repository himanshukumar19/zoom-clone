"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  name: string;
  avatarUrl: string;
}

// Static placeholder user (no auth). The real data comes from /api/me.
const PLACEHOLDER_AVATAR_URL = "/default-user-avatar.png";

export function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the default user (id=1) – no login required.
  useEffect(() => {
    async function fetchDefaultUser() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // Fallback placeholder.
          setUser({ name: "User", avatarUrl: PLACEHOLDER_AVATAR_URL });
        }
      } catch {
        setUser({ name: "User", avatarUrl: PLACEHOLDER_AVATAR_URL });
      } finally {
        setLoading(false);
      }
    }

    fetchDefaultUser();
  }, []);

  if (loading) {
    // Render a lightweight placeholder to avoid layout shift.
    return (
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-2">
          <Wordmark compact />
          <div className="hidden h-6 w-1 bg-muted/40 md:block" />
          <div className="hidden h-4 w-24 bg-muted/40 md:block" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-9 w-24 rounded-full bg-muted/40" />
          <div className="h-9 w-9 rounded-full bg-muted/40" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4">
      {/* Left side: Wordmark + Workplace */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Wordmark compact />
          <div className="hidden h-6 w-1 bg-muted/20 md:block" aria-hidden />
          <div className="hidden text-sm font-medium text-muted md:block">
            Workplace
          </div>
        </Link>
      </div>

      {/* Center: Search pill placeholder */}
      <div className="hidden flex-1 items-center justify-center md:flex">
        <div className="flex w-full max-w-md items-center gap-2 rounded-full border bg-muted/10 px-4 py-2 text-sm text-muted/60">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </div>
      </div>

      {/* Right side: Bell + Avatar menu */}
      <div className="flex items-center gap-4">
        {/* Bell placeholder */}
        <button className="rounded-full p-2 text-muted/60 hover:bg-muted/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </button>

        {/* Avatar with static placeholder menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">
            <img
              src={user?.avatarUrl || PLACEHOLDER_AVATAR_URL}
              alt="User avatar"
              className="h-9 w-9 rounded-full border object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user?.name || "U");
              }}
            />
            <span className="hidden text-sm font-medium md:block">{user?.name}</span>
          </button>

          {/* Static placeholder menu – no auth items (no sign out, etc.) */}
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border bg-white py-1 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <div className="px-4 py-2 text-sm text-muted">Signed in as</div>
            <div className="px-4 py-2 text-sm font-medium">{user?.name}</div>
            {/* Placeholder divider */}
            <div className="my-1 border-t" />
            {/* Static items only – e.g., Profile */}
            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-muted/10">Profile</button>
            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-muted/10">Settings</button>
            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-muted/10">Help</button>
          </div>
        </div>
      </div>
    </nav>
  );
}