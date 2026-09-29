"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

// Temporary scaffold home. Real dashboard lands in T-011/T-012/T-013.
// Client-rendered on purpose: no backend fetch at build time (plan D18).
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app px-4">
      <Wordmark />
      <p className="text-center text-muted">
        Frontend scaffold is up. Dashboard, join, schedule, and room pages land
        in later tickets.
      </p>
      <Link
        href="/style-guide"
        className="rounded-lg bg-zoom-blue px-5 py-2.5 font-bold text-white hover:bg-zoom-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
      >
        Open style guide
      </Link>
    </main>
  );
}
