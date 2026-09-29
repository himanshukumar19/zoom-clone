"use client";

import Link from "next/link";
import { Home, MessageSquare, Video, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
  { href: "#", icon: MessageSquare, label: "Chat", match: () => false },
  {
    href: "/",
    icon: Video,
    label: "Meetings",
    match: (p: string) => p === "/" && false, // meetings lives on home
  },
  { href: "#", icon: Users, label: "Contacts", match: () => false },
];

const settingsItem = {
  href: "#",
  icon: Settings,
  label: "Settings",
  match: (p: string) => p.startsWith("/settings"),
};

export function IconRail() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-16 flex-col items-center border-r border-line bg-white pt-20 pb-4">
      {/* Top nav items */}
      <nav className="flex flex-col items-center gap-1 w-full px-1">
        {navItems.map(({ href, icon: Icon, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-0.5 w-full py-2 px-1 rounded-xl transition-colors group ${
                active
                  ? "text-zoom-blue"
                  : "text-muted hover:text-ink hover:bg-app"
              }`}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  active ? "text-zoom-blue" : "text-[#555]"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium leading-tight ${
                  active ? "text-zoom-blue" : "text-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings at bottom */}
      <Link
        href={settingsItem.href}
        className={`flex flex-col items-center gap-0.5 w-full py-2 px-1 rounded-xl transition-colors ${
          settingsItem.match(pathname)
            ? "text-zoom-blue"
            : "text-muted hover:text-ink hover:bg-app"
        }`}
        aria-label="Settings"
      >
        <Settings
          className={`h-6 w-6 ${
            settingsItem.match(pathname) ? "text-zoom-blue" : "text-[#555]"
          }`}
          strokeWidth={2}
        />
        <span className="text-[10px] font-medium leading-tight text-muted">
          Settings
        </span>
      </Link>
    </aside>
  );
}