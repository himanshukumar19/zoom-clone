"use client";

import { Calendar, Camera, Plus } from "lucide-react";

// Action tile variants. Colors/spacing come from plan §8.0 tokens.
// Click wiring lands in T-013/T-014.
type ActionTileProps = {
  label: string;
  icon: React.ReactNode;
  variant?: "new" | "join" | "schedule";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClass: Record<"new" | "join" | "schedule", string> = {
  new: "bg-zoom-orange text-white hover:brightness-110",
  join: "bg-zoom-blue text-white hover:bg-zoom-blue-dark",
  schedule: "bg-zoom-blue text-white hover:bg-zoom-blue-dark",
};

export function ActionTile({ label, icon, variant = "new", ...props }: ActionTileProps) {
  return (
    <button
      type="button"
      className={
        "flex h-40 w-36 flex-col items-center justify-center gap-3 rounded-2xl " +
        "font-bold shadow-md transition-all duration-150 focus-visible:outline-2 " +
        "focus-visible:outline-offset-2 focus-visible:outline-zoom-blue " +
        variantClass[variant] +
        " " +
        props.className
      }
      {...props}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-30 p-2">
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export function ActionTiles() {
  return (
    <nav className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
      <ActionTile
        label="New"
        variant="new"
        aria-label="Start a new meeting"
        icon={<Camera className="h-8 w-8" strokeWidth={2} />}
      />
      <ActionTile
        label="Join"
        variant="join"
        aria-label="Join a meeting"
        icon={<Plus className="h-8 w-8" strokeWidth={2} />}
      />
      <ActionTile
        label="Schedule"
        variant="schedule"
        aria-label="Schedule a meeting"
        icon={<Calendar className="h-8 w-8" strokeWidth={2} />}
      />
    </nav>
  );
}
