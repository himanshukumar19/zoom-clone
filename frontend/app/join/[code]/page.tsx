"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getMeeting, joinMeeting } from "@/lib/api";
import { loadParticipantId, saveParticipantId } from "@/lib/session";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/Wordmark";
import type { Meeting } from "@/types";

export default function JoinNamePage() {
  const router = useRouter();
  const params = useParams();
  const codeRaw = Array.isArray(params?.code) ? params.code[0] : params?.code || "";
  const codeNormalized = codeRaw.replace(/\s+/g, "");

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [meetingError, setMeetingError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const fetchMeeting = useCallback(async () => {
    if (!codeNormalized || !/^\d{10}$/.test(codeNormalized)) {
      setMeetingError("Meeting ID not found. Check it and try again.");
      setLoadingMeeting(false);
      return;
    }
    setLoadingMeeting(true);
    setMeetingError(null);
    try {
      const data = await getMeeting(codeNormalized);
      setMeeting(data);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const msg = (err as { detail?: string }).detail || "Something went wrong.";
      if (status === 404) {
        setMeetingError("Meeting ID not found. Check it and try again.");
      } else if (status === 410) {
        setMeetingError("This meeting has ended.");
      } else {
        setMeetingError(msg);
      }
      setMeeting(null);
    } finally {
      setLoadingMeeting(false);
    }
  }, [codeNormalized]);

  useEffect(() => {
    if (codeNormalized) fetchMeeting();
  }, [codeNormalized, fetchMeeting]);

  const trimmedName = name.trim();
  const canJoin = trimmedName.length > 0 && trimmedName.length <= 50 && !joining && !loadingMeeting && meeting;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    if (!trimmedName) {
      setNameError("Enter your display name.");
      return;
    }
    if (trimmedName.length > 50) {
      setNameError("Display name must be 50 characters or less.");
      return;
    }
    if (!meeting) return;

    setJoining(true);
    try {
      const existingId = loadParticipantId(codeNormalized);
      const result = await joinMeeting(codeNormalized, trimmedName, existingId);
      saveParticipantId(codeNormalized, result.participant.id);
      router.push(`/meeting/${codeNormalized}`);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const msg = (err as { detail?: string }).detail || "Failed to join meeting.";
      if (status === 403) {
        setNameError("You were removed from this meeting.");
      } else if (status === 410) {
        setNameError("This meeting has ended.");
      } else if (status === 422) {
        setNameError(msg);
      } else {
        setNameError(msg);
      }
    } finally {
      setJoining(false);
    }
  };

  if (loadingMeeting) {
    return (
      <div className="min-h-screen bg-white text-ink flex items-center justify-center px-6">
        <header className="absolute top-0 left-0 right-0 flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <a href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue rounded-md"><Wordmark /></a>
        </header>
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-muted">Loading meeting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-ink flex flex-col">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <a href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue rounded-md">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <a href="#" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Support</a>
          <a href="/schedule" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Schedule</a>
          <a href="/join" className="text-zoom-blue">Join</a>
          <a href="#" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Host</a>
          <a href="#" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Web App</a>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pt-28 pb-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black tracking-tight text-ink text-center mb-2">Join Meeting</h1>

          {meetingError && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-danger font-medium">{meetingError}</p>
            </div>
          )}

          {!meetingError && meeting && (
            <>
              <p className="text-sm text-muted text-center mb-8">
                Meeting: <span className="font-bold text-ink">{meeting.title}</span>
              </p>
              <form onSubmit={handleJoin} className="flex flex-col gap-4" noValidate>
                <Input
                  id="display-name"
                  label="Your Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  error={nameError || undefined}
                  maxLength={50}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!canJoin}
                  className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
                  aria-label="Join meeting"
                >
                  <span>Join</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </>
          )}

          {!meetingError && !meeting && (
            <p className="text-sm text-muted text-center">Meeting not available.</p>
          )}
        </div>
      </main>

      <footer className="border-t border-line bg-app py-4 text-center text-xs text-muted">
        © 2026 zoom-clone (assignment project). All rights reserved.
      </footer>
    </div>
  );
}
