"use client";
import { MeetingsCard } from "@/components/dashboard/MeetingsCard";
import { PortalSidebar } from "@/components/schedule/PortalSidebar";
export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      <PortalSidebar />
      <main className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-[720px] px-6 pt-9 pb-10">
          <h1 className="text-2xl font-extrabold text-ink mb-6">Meetings</h1>
          <MeetingsCard />
        </div>
      </main>
    </div>
  );
}
