"use client";

import Link from "next/link";
import { Home, CalendarDays } from "lucide-react";

export function PortalSidebar() {
  return (
    <aside className="w-60 shrink-0 bg-sidebar rounded-xl border border-line p-3">
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-white hover:shadow-sm transition"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zoom-blue bg-white shadow-sm border border-line"
        >
          <CalendarDays className="h-4 w-4" />
          Meetings
        </Link>
      </nav>
    </aside>
  );
}
