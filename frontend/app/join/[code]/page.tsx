"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getMeeting, joinMeeting } from "@/lib/api";
import { loadParticipantId, saveParticipantId } from "@/lib/session";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
      <main className="min-h-screen bg-[#1C1C1E] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="text-sm text-muted">Loading meeting…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1C1C1E] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tight mb-2">Join a meeting</h1>

        {meetingError && (
          <div className="mb-6 rounded-xl bg-red-900/20 border border-red-900/30 px-4 py-3">
            <p className="text-sm text-red-300 font-medium">{meetingError}</p>
          </div>
        )}

        {!meetingError && meeting && (
          <>
            <p className="text-sm text-muted mb-8">Meeting: <span className="font-bold text-white">{meeting.title}</span></p>

            <form onSubmit={handleJoin} className="flex flex-col gap-4" noValidate>
              <Input
                id="display-name"
                label="Your name"
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
                className="w-full"
                aria-label="Join meeting"
              >
                <span>Join</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </>
        )}

        {!meetingError && !meeting && (
          <p className="text-sm text-muted">Meeting not available.</p>
        )}
      </div>
    </main>
  );
}
