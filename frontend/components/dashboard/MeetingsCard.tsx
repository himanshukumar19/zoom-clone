"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock as ClockIcon, Copy, Play, Check, Link as LinkIcon } from "lucide-react";
import { listMeetings, startMeeting } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Meeting, MeetingListFilter } from "@/types";

function formatLocalDateTime(utcString: string | null): string {
  if (!utcString) return "No start time";
  const d = new Date(utcString);
  if (isNaN(d.getTime())) return "Invalid date";
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${weekday}, ${month} ${day}, ${year} · ${time}`;
}

function formatDuration(mins: number | null): string {
  if (mins == null) return "—";
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
  }
  return `${mins} min`;
}

function EmptyIllustration({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted">
      {/* Simple calendar/meetings illustration using emoji or SVG */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="8" y="16" width="64" height="56" rx="6" fill="#EEF1F6" />
        <rect x="8" y="16" width="64" height="20" rx="6" fill="#D8E2F5" />
        <rect x="20" y="8" width="8" height="16" rx="4" fill="#0B5CFF" />
        <rect x="52" y="8" width="8" height="16" rx="4" fill="#0B5CFF" />
        <rect x="20" y="44" width="12" height="12" rx="2" fill="#C5D5F0" />
        <rect x="38" y="44" width="12" height="12" rx="2" fill="#C5D5F0" />
        <rect x="56" y="44" width="4" height="12" rx="2" fill="#C5D5F0" />
      </svg>
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600 border border-red-100">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      Live
    </span>
  );
}

export function MeetingsCard() {
  const [tab, setTab] = useState<MeetingListFilter>("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const pushToast = useToast();

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listMeetings(tab);
      setMeetings(data);
    } catch {
      // Silently fail; card shows empty state if needed.
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleStart = async (code: string) => {
    try {
      await startMeeting(code);
      pushToast("success", "Meeting started.");
      await fetchList();
    } catch (e) {
      const err = e as { status?: number; message?: string; detail?: string };
      const msg = err?.message || err?.detail || "Failed to start meeting.";
      pushToast("error", msg);
    }
  };

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      pushToast("success", "Invite link copied.");
    } catch {
      pushToast("error", "Failed to copy link.");
    }
  };

  return (
    <section className="w-full rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
      {/* Header with title + tab strip */}
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink">Upcoming</h2>
        </div>

        {/* Flat underline tabs — matches Zoom reference image 07 */}
        <div className="flex border-b border-line">
          {(["upcoming", "recent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-zoom-blue text-zoom-blue"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t === "upcoming" ? "Upcoming" : "Previous"}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting rows */}
      <div className="px-6">
        {loading ? (
          <div className="py-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-app" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-app" />
                  <div className="h-3 w-1/4 rounded bg-app" />
                </div>
                <div className="h-8 w-24 rounded bg-app" />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <EmptyIllustration
            label={
              tab === "upcoming"
                ? "No upcoming meetings. Schedule one or start instantly."
                : "No previous meetings."
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {meetings.map((m) => (
              <li key={m.id} className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-infobg border border-[#C5D8F7] text-zoom-blue">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink truncate max-w-[16rem] sm:max-w-sm md:max-w-md lg:max-w-xl">
                          {m.title}
                        </h3>
                        {m.status === "live" && <LiveBadge />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted flex-wrap">
                        <span>
                          {m.scheduled_start
                            ? formatLocalDateTime(m.scheduled_start)
                            : "Instant meeting"}
                        </span>
                        {m.duration_minutes != null && (
                          <>
                            <span className="text-line">·</span>
                            <span>{formatDuration(m.duration_minutes)}</span>
                          </>
                        )}
                        <span className="text-line">·</span>
                        <span className="font-mono tracking-wide">
                          {m.meeting_code_display}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {tab === "upcoming" && (
                      <>
                        <button
                          onClick={() => handleStart(m.meeting_code)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-zoom-blue px-3.5 py-2 text-sm font-semibold text-white hover:bg-zoom-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
                          aria-label={`Start meeting ${m.meeting_code_display}`}
                        >
                          <Play className="h-3.5 w-3.5" fill="currentColor" />
                          Start
                        </button>
                        <button
                          onClick={() => handleCopy(m.invite_link)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink hover:bg-app transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
                          aria-label={`Copy invite link for ${m.meeting_code_display}`}
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Copy Link
                        </button>
                      </>
                    )}
                    {tab === "recent" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-app border border-line px-3 py-1.5 text-xs font-medium text-muted">
                        <Check className="h-3 w-3" />
                        Ended
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
