"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CalendarDays, Copy, Play, Check } from "lucide-react";
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
  return `${mins} min`;
}

function EmptyIllustration({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-app border border-line">
        <CalendarDays className="h-7 w-7 text-muted/50" />
      </div>
      <p className="text-sm font-medium">{label}</p>
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

  const upcomingMeetings = meetings;
  const recentMeetings = meetings;

  const activeMeetings = tab === "upcoming" ? upcomingMeetings : recentMeetings;

  return (
    <section className="w-full rounded-2xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h2 className="text-xl font-black text-ink tracking-tight">Meetings</h2>
        <div className="flex items-center gap-1 rounded-full bg-app p-0.5 border border-line">
          {(["upcoming", "recent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                tab === t
                  ? "bg-zoom-blue text-white shadow-sm"
                  : "text-muted hover:text-ink hover:bg-app"
              }`}
            >
              {t === "upcoming" ? "Upcoming" : "Recent"}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-line" />

      {/* Rows */}
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
        ) : activeMeetings.length === 0 ? (
          <EmptyIllustration
            label={
              tab === "upcoming"
                ? "No meetings scheduled."
                : "No recent meetings."
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {activeMeetings.map((m) => (
              <li key={m.id} className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app border border-line text-zoom-blue">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-ink truncate max-w-[16rem] sm:max-w-sm md:max-w-md lg:max-w-xl">
                          {m.title}
                        </h3>
                        {m.status === "live" && <LiveBadge />}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                        <span className="font-medium">
                          {m.scheduled_start
                            ? formatLocalDateTime(m.scheduled_start)
                            : "Instant"}
                        </span>
                        <span className="text-line">|</span>
                        <span>{formatDuration(m.duration_minutes)}</span>
                        <span className="text-line">|</span>
                        <span className="font-mono tracking-wide text-ink/70">
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
                          className="inline-flex items-center gap-1.5 rounded-lg bg-zoom-blue px-3.5 py-2 text-sm font-bold text-white hover:bg-zoom-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
                          aria-label={`Start meeting ${m.meeting_code_display}`}
                        >
                          <Play className="h-3.5 w-3.5" fill="currentColor" />
                          Start
                        </button>
                        <button
                          onClick={() => handleCopy(m.invite_link)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink hover:bg-app transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
                          aria-label={`Copy invite link for ${m.meeting_code_display}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
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
