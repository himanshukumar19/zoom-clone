"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Clock } from "@/components/dashboard/Clock";
import { ActionTiles } from "@/components/dashboard/ActionTiles";

// Dashboard hero (spec 01): live clock + New/Join/Schedule tiles.
// Visuals implemented in T-012; click behavior wired in T-013/T-014.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-app px-4">
      <div className="flex flex-col items-center justify-center gap-8">
        <Clock />
        <ActionTiles />
      </div>
      
      <Link
        href="/style-guide"
        className="rounded-lg bg-zoom-blue px-5 py-2.5 font-bold text-white hover:bg-zoom-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
      >
        Open style guide
      </Link>
    </main>
  );
}