"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MeetingsCard } from "@/components/dashboard/MeetingsCard";
import { PortalSidebar } from "@/components/schedule/PortalSidebar";
export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      <PortalSidebar />
      <main className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-[720px] px-6 pt-9 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h1 className="text-2xl font-extrabold text-ink">Meetings</h1>
            <Button as={Link} href="/schedule" className="w-full sm:w-auto">+ Schedule a Meeting</Button>
          </div>
          <MeetingsCard />
        </div>
      </main>
    </div>
  );
}
