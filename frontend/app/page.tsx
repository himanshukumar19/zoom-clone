"use client";

import { MeetingsCard } from "@/components/dashboard/MeetingsCard";
import { Clock } from "@/components/dashboard/Clock";
import { ActionTiles } from "@/components/dashboard/ActionTiles";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <Clock />
        <ActionTiles />
        <MeetingsCard />
      </div>
    </main>
  );
}