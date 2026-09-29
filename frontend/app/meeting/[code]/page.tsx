"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Link2, Copy, Check } from "lucide-react";
import { getMeeting, listParticipants } from "@/lib/api";
import { loadParticipantId } from "@/lib/session";
import { InviteDialog } from "@/components/room/InviteDialog";
import { ParticipantTile } from "@/components/room/ParticipantTile";
import { useToast } from "@/components/ui/Toast";
import type { Meeting, Participant } from "@/types";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m.toString().padStart(2, "0")}m`);
  parts.push(`${s.toString().padStart(2, "0")}s`);
  return parts.join(" ");
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const pushToast = useToast();
  const codeRaw = Array.isArray(params?.code) ? params.code[0] : params?.code || "";
  const codeNormalized = codeRaw.replace(/\s+/g, "");

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMeeting = useCallback(async () => {
    try {
      const data = await getMeeting(codeNormalized);
      setMeeting(data);
    } catch {
      router.push(`/join/${codeNormalized}`);
    } finally {
      setLoading(false);
    }
  }, [codeNormalized, router]);

  const fetchParticipants = useCallback(async () => {
    try {
      const list = await listParticipants(codeNormalized);
      setParticipants(list);
    } catch {
      // Silently keep previous roster on poll errors.
    }
  }, [codeNormalized]);

  useEffect(() => {
    if (!codeNormalized) {
      router.replace("/");
      return;
    }
    const pid = loadParticipantId(codeNormalized);
    if (pid === null) {
      router.replace(`/join/${codeNormalized}`);
      return;
    }
    fetchMeeting();
  }, [codeNormalized, router, fetchMeeting]);

  // Start timer when meeting loads; reset on unmount.
  useEffect(() => {
    if (!meeting) return;
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [meeting?.id]);

  // Poll participants every 5 seconds.
  useEffect(() => {
    if (!meeting || !codeNormalized) return;
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [meeting, codeNormalized, fetchParticipants]);

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
          <div className="flex items-center gap-3">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm text-[#A0A0A8]">Loading room...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1C1C1E] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-[#1C1C1E]/90 px-6 py-4 backdrop-blur-md">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight">{meeting.title}</h1>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="font-mono text-xs font-medium tracking-widest text-[#A0A0A8]">
              {meeting.meeting_code_display}
            </span>
            <span className="text-[#555]">·</span>
            <span className="text-xs font-medium text-[#A0A0A8]">Host: {meeting.host.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-mono font-medium text-[#A0A0A8] ring-1 ring-white/10">
            <span>Elapsed</span>
            <span className="text-white tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            aria-label="Invite / Info"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
          >
            <Link2 className="h-4 w-4" />
            <span>Invite</span>
          </button>
        </div>
      </header>

      {/* Room body: tile grid */}
      <section className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#A0A0A8]">
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {participants.map((p) => (
              <ParticipantTile key={p.id} p={p} />
            ))}
          </div>

          {participants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2A2A2E] text-2xl font-black">
                {meeting.host.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="mt-4 text-sm text-[#A0A0A8]">Waiting for others to join...</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom invite link bar (minimal shell, no toolbar actions per T-017 scope) */}
      <section className="border-t border-white/10 bg-[#232326]/60 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <code className="truncate text-xs font-medium text-[#A0A0A8]">{meeting.invite_link}</code>
          </div>
          <button
            onClick={handleCopy}
            aria-label="Copy invite link"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-zoom-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-zoom-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

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
