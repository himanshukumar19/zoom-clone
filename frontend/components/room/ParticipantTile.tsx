"use client";

import { MicOff } from "lucide-react";
import type { Participant } from "@/types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ParticipantTile({ p }: { p: Participant }) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl bg-[#2A2A2E] p-6 shadow-lg transition hover:bg-[#34343A]">
      {/* Initials avatar */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 text-3xl font-black tracking-tight text-white shadow-inner ring-1 ring-white/10">
        {initials(p.display_name)}
      </div>

      {/* Name */}
      <div className="mt-4 text-center">
        <h3 className="text-base font-bold leading-tight text-white">{p.display_name}</h3>
        <div className="mt-1 flex items-center justify-center gap-2">
          {p.role === "host" && (
            <span className="rounded-full bg-zoom-blue px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
              Host
            </span>
          )}
          {p.is_muted && (
            <span className="inline-flex items-center gap-0.5 text-muted" aria-label="Muted" title="Muted">
              <MicOff className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold">Muted</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
