"use client";
import { MeetingsCard } from "@/components/dashboard/MeetingsCard";
import { PortalSidebar } from "@/components/schedule/PortalSidebar";
export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      <PortalSidebar />
      <main className="flex-1 px-6 py-10 ml-0 md:ml-72">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold text-ink mb-6">Meetings</h1>
          <MeetingsCard />
        </div>
      </main>
    </div>
  );
}
