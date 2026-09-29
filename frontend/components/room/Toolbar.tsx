"use client";

import { Mic, MicOff, Users, Link2, LogOut, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function Toolbar({
  isMuted,
  onMuteToggle,
  participantsOpen,
  onParticipantsToggle,
  onInvite,
  onLeave,
  isHost,
  onEnd,
}: {
  isMuted: boolean;
  onMuteToggle: () => void;
  participantsOpen: boolean;
  onParticipantsToggle: () => void;
  onInvite: () => void;
  onLeave: () => void;
  isHost?: boolean;
  onEnd?: () => void;
}) {
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Meeting toolbar"
        className="sticky bottom-0 z-30 w-full border-t border-white/10 bg-[#232326]/90 px-4 py-3 backdrop-blur-md /* mobile-first: always visible */"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Left cluster: Mute + Participants */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMuteToggle}
              aria-label={isMuted ? "Unmute" : "Mute"}
              aria-pressed={isMuted}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue ${
                isMuted
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={onParticipantsToggle}
              aria-label="Participants"
              aria-pressed={participantsOpen}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue ${
                participantsOpen
                  ? "bg-zoom-blue text-white hover:bg-zoom-blue-dark"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
              title="Participants"
            >
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline text-xs font-bold">Participants</span>
            </button>
          </div>

          {/* Right cluster: Invite + Leave */}
          <div className="flex items-center gap-2">
            <button
              onClick={onInvite}
              aria-label="Invite"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
              title="Invite"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </button>

            <button
              onClick={() => setLeaveConfirmOpen(true)}
              aria-label="Leave meeting"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-rose-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
              title="Leave meeting"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </nav>

      <Modal
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        title={isHost ? "Leave or end meeting" : "Leave meeting"}
      >
        <div className="space-y-4">
          {isHost && (
            <>
              <p className="text-sm text-muted">As host, you can end the meeting for everyone.</p>
              <button
                onClick={() => {
                  setLeaveConfirmOpen(false);
                  onEnd?.();
                }}
                className="w-full rounded-md bg-red-600 px-3 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                End meeting for all
              </button>
              <div className="border-t border-line" />
            </>
          )}
          <p className="text-sm text-muted">Are you sure you want to leave this meeting?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setLeaveConfirmOpen(false)}
              className="rounded-md px-3 py-2 text-xs font-bold text-ink hover:bg-app focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setLeaveConfirmOpen(false);
                onLeave();
              }}
              className="rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
            >
              Leave meeting
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
