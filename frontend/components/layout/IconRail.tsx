"use client";

import Link from "next/link";
import { Home, Calendar, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export function IconRail() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home", active: pathname === "/" },
    { href: "/meetings", icon: Calendar, label: "Meetings", active: pathname.startsWith("/meetings") },
    { href: "/settings", icon: Settings, label: "Settings", active: pathname.startsWith("/settings") },
  ];

  const HomeIcon = navItems[0].icon;
  const MeetingsIcon = navItems[1].icon;
  const SettingsIcon = navItems[2].icon;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-14 flex-col items-center justify-between border-r bg-sidebar p-4 pt-6 space-y-12">
      {/* Top: Home */}
      <Link
        href={navItems[0].href}
        className={`
          relative flex w-9 items-center justify-center rounded-full p-1 transition-colors
          ${navItems[0].active ? "bg-zoom-blue text-white" : "text-muted hover:bg-muted/10"}
        `}
        aria-label="Home"
      >
        <HomeIcon className="h-5 w-5" aria-hidden="true" />
        <span className="absolute left-[calc(100%+8px)] -top-px whitespace-nowrap text-sm font-medium">
          {navItems[0].label}
        </span>
      </Link>

      {/* Middle: Meetings */}
      <Link
        href={navItems[1].href}
        className={`
          relative flex w-9 items-center justify-center rounded-full p-1 transition-colors
          ${navItems[1].active ? "bg-zoom-blue text-white" : "text-muted hover:bg-muted/10"}
        `}
        aria-label="Meetings"
      >
        <MeetingsIcon className="h-5 w-5" aria-hidden="true" />
        <span className="absolute left-[calc(100%+8px)] -top-px whitespace-nowrap text-sm font-medium">
          {navItems[1].label}
        </span>
      </Link>

      {/* Bottom spacer */}
      <div className="mt-auto h-6" />

      {/* Bottom: Settings */}
      <Link
        href={navItems[2].href}
        className={`
          relative flex w-9 items-center justify-center rounded-full p-1 transition-colors
          ${navItems[2].active ? "bg-zoom-blue text-white" : "text-muted hover:bg-muted/10"}
        `}
        aria-label="Settings"
      >
        <SettingsIcon className="h-5 w-5" aria-hidden="true" />
        <span className="absolute left-[calc(100%+8px)] -top-px whitespace-nowrap text-sm font-medium">
          {navItems[2].label}
        </span>
      </Link>
    </aside>
  );
}