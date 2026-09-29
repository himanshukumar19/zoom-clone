"use client";

import { MeetingsCard } from "@/components/dashboard/MeetingsCard";
import { Clock } from "@/components/dashboard/Clock";
import { ActionTiles } from "@/components/dashboard/ActionTiles";

export default function Home() {
  return (
    <main className="flex flex-col items-center bg-white min-h-[calc(100vh-64px)]">
      {/* Centered content area matching Zoom web client home (reference image 03) */}
      <div className="w-full max-w-2xl px-4 py-12 flex flex-col gap-8">
        {/* Large clock + date */}
        <Clock />

        {/* Compact action icon buttons */}
        <ActionTiles />

        {/* Meetings list with tab strip */}
        <MeetingsCard />
      </div>
    </main>
  );
}