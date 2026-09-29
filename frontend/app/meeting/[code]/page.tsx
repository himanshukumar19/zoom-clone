"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Link2, Copy, Check } from "lucide-react";
import { getMeeting } from "@/lib/api";
import { loadParticipantId } from "@/lib/session";
import { InviteDialog } from "@/components/room/InviteDialog";
import { useToast } from "@/components/ui/Toast";
import type { Meeting } from "@/types";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const pushToast = useToast();
  const codeRaw = Array.isArray(params?.code) ? params.code[0] : params?.code || "";
  const codeNormalized = codeRaw.replace(/\s+/g, "");

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchMeeting = useCallback(async () => {
    try {
      const data = await getMeeting(codeNormalized);
      setMeeting(data);
    } catch {
      // If meeting can't be fetched, redirect back to join.
      router.push(`/join/${codeNormalized}`);
    } finally {
      setLoading(false);
    }
  }, [codeNormalized, router]);

  useEffect(() => {
    if (!codeNormalized) {
      router.replace("/");
      return;
    }
    // Guard: must have participant identity for this code (session only, not auth).
    const pid = loadParticipantId(codeNormalized);
    if (pid === null) {
      router.replace(`/join/${codeNormalized}`);
      return;
    }
    fetchMeeting();
  }, [codeNormalized, router, fetchMeeting]);

  const handleCopy = async () => {
    if (!meeting) return;
    try {
      await navigator.clipboard.writeText(meeting.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      pushToast("success", "Invite link copied.");
    } catch {
      pushToast("error", "Failed to copy link.");
    }
  };

  if (loading || !meeting) {
    return (
      <main className="min-h-screen bg-[#1C1C1E] text-white">
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-muted">Loading room...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1C1C1E] text-white">
      {/* Room header */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight">{meeting.title}</h1>
          <p className="text-xs font-mono text-muted">Meeting ID: {meeting.meeting_code_display}</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          aria-label="Invite"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
        >
          <Link2 className="h-4 w-4" />
          Invite
        </button>
      </header>

      {/* Room body */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2A2A2E] text-2xl font-black tracking-tight shadow-lg">
          {meeting.host.name.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="text-xl font-black">{meeting.title}</h2>
        <p className="mt-1 text-sm text-muted">Host: {meeting.host.name}</p>
        <p className="mt-1 text-xs font-mono text-muted">{meeting.meeting_code_display}</p>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <code className="truncate text-xs font-medium text-white">{meeting.invite_link}</code>
            <button
              onClick={handleCopy}
              aria-label="Copy invite link"
              className="inline-flex items-center gap-1 rounded bg-zoom-blue px-2 py-1 text-[10px] font-bold text-white hover:bg-zoom-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Entry invite dialog */}
      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        inviteLink={meeting.invite_link}
        codeDisplay={meeting.meeting_code_display}
      />
    </main>
  );
}
