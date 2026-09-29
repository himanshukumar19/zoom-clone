"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, CalendarDays, Clock } from "lucide-react";
import { scheduleMeeting } from "@/lib/api";
import { PortalSidebar } from "@/components/schedule/PortalSidebar";

function formatDisplayCode(code: string) {
  return code.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
}

export default function SchedulePage() {
  const [title, setTitle] = useState("My Meeting");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  // Date / time in browser-local time
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("09:30");
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");

  // Duration: hr/min selects (default 0 hr, 40 min)
  const [durHr, setDurHr] = useState(0);
  const [durMin, setDurMin] = useState(40);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState<{ code_display: string; invite_link: string; title: string; scheduled_start: string; duration_minutes: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize date to tomorrow 9:30 AM
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setDateStr(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Pre-select title text on first focus
  useEffect(() => {
    if (titleInputRef.current) {
      const onFocus = () => {
        if (titleInputRef.current) titleInputRef.current.select();
      };
      titleInputRef.current.addEventListener("focus", onFocus, { once: true });
    }
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) {
      next.title = "Topic is required.";
    }
    if (!dateStr) {
      next.date = "Date is required.";
    }
    if (!timeStr) {
      next.time = "Time is required.";
    }
    // Duration > 0
    if (durHr === 0 && durMin === 0) {
      next.duration = "Duration must be greater than 0.";
    }
    // Past start check: combine date + time into local Date, compare to now
    if (dateStr && timeStr) {
      const [year, month, day] = dateStr.split("-").map(Number);
      let [hour, minute] = timeStr.split(":").map(Number);
      if (amPm === "PM" && hour !== 12) hour += 12;
      if (amPm === "AM" && hour === 12) hour = 0;
      const startLocal = new Date(year, month - 1, day, hour, minute);
      if (startLocal <= new Date()) {
        next.start = "Start time must be in the future.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      // Build UTC instant from local picks
      const [year, month, day] = dateStr.split("-").map(Number);
      let [hour, minute] = timeStr.split(":").map(Number);
      if (amPm === "PM" && hour !== 12) hour += 12;
      if (amPm === "AM" && hour === 12) hour = 0;
      const startLocal = new Date(year, month - 1, day, hour, minute);
      const scheduled_start = startLocal.toISOString();

      const result = await scheduleMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_start,
        duration_minutes: durHr * 60 + durMin,
      });

      setMeeting({
        title: result.title,
        code_display: result.meeting_code_display,
        invite_link: result.invite_link,
        scheduled_start: result.scheduled_start || "",
        duration_minutes: result.duration_minutes || 0,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to schedule meeting.";
      setErrors({ submit: message });
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!meeting) return;
    navigator.clipboard.writeText(meeting.invite_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Browser timezone label
  const timeZoneLabel = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Local";
    }
  })();

  if (meeting) {
    // Success state
    const startLocal = new Date(meeting.scheduled_start);
    const formattedTime = startLocal.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const durationText =
      meeting.duration_minutes >= 60
        ? `${Math.floor(meeting.duration_minutes / 60)} hr ${meeting.duration_minutes % 60} min`
        : `${meeting.duration_minutes} min`;

    return (
      <div className="min-h-screen bg-app">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zoom-blue hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </Link>
          <div className="bg-white rounded-2xl border border-line p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-zoom-blue text-white flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-ink">Meeting Scheduled</h1>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Topic</div>
                <div className="text-lg font-medium text-ink">{meeting.title}</div>
              </div>
              <div className="flex gap-8">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">When</div>
                  <div className="text-ink font-medium">{formattedTime}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Duration</div>
                  <div className="text-ink font-medium">{durationText}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Meeting ID</div>
                <div className="text-xl font-bold text-ink tracking-widest">{meeting.code_display}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8 p-4 bg-infobg rounded-xl border border-[#C5D8F7]">
              <div className="text-sm text-ink flex-1 truncate">
                <span className="font-medium">Invite Link:</span>{" "}
                <a href={meeting.invite_link} target="_blank" rel="noopener noreferrer" className="text-zoom-blue hover:underline">{meeting.invite_link}</a>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg bg-zoom-blue text-white px-4 py-2 text-sm font-bold hover:bg-zoom-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
                aria-label="Copy invite link"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Invite Link"}
              </button>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-zoom-blue text-white px-6 py-3 text-sm font-bold hover:bg-zoom-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto max-w-4xl px-4 py-6 flex gap-8">
        <PortalSidebar />

        <main className="flex-1 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zoom-blue hover:underline mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </Link>
          <h1 className="text-2xl font-bold text-ink mb-8">Schedule Meeting</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="bg-white rounded-2xl border border-line p-8 shadow-sm space-y-6"
            noValidate
          >
            {/* Topic */}
            <div className="flex gap-8 items-start">
              <label htmlFor="topic" className="w-36 pt-2 text-sm font-medium text-ink shrink-0 flex items-center gap-1">
                <span className="text-danger">*</span> Topic
              </label>
              <div className="flex-1 min-w-0">
                <input
                  id="topic"
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => {
                    if (titleInputRef.current) titleInputRef.current.select();
                  }}
                  maxLength={200}
                  className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition ${errors.title ? "border-danger" : "border-line"}`}
                  placeholder="My Meeting"
                />
                {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
              </div>
            </div>

            {/* Add Description reveal */}
            <div className="flex gap-8 items-start">
              <div className="w-36 pt-2 text-sm font-medium text-ink shrink-0" />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowDescription((s) => !s)}
                  className="text-sm text-zoom-blue hover:underline font-medium"
                >
                  {showDescription ? "− Hide Description" : "+ Add Description"}
                </button>
                {showDescription && (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full mt-2 p-3 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition resize-none"
                    placeholder="Meeting description"
                  />
                )}
              </div>
            </div>

            {/* When: date + time + AM/PM */}
            <div className="flex gap-8 items-start">
              <label className="w-36 pt-2 text-sm font-medium text-ink shrink-0">When</label>
              <div className="flex-1 flex flex-wrap gap-3 min-w-0">
                <div className="relative">
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className={`w-40 h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition ${errors.date ? "border-danger" : "border-line"}`}
                  />
                  <CalendarDays className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                </div>
                <select
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className={`w-28 h-10 px-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition bg-white ${errors.time ? "border-danger" : "border-line"}`}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h12 = i + 1;
                    return ["00", "30"].map((m) => (
                      <option key={`${h12}-${m}`} value={`${String(h12).padStart(2, "0")}:${m}`}>
                        {`${h12}:${m}`}
                      </option>
                    ));
                  }).flat()}
                </select>
                <select
                  value={amPm}
                  onChange={(e) => setAmPm(e.target.value as "AM" | "PM")}
                  className="w-20 h-10 px-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition bg-white"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
                {(errors.date || errors.time) && (
                  <div className="text-xs text-danger">{errors.date || errors.time}</div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="flex gap-8 items-start">
              <label className="w-36 pt-2 text-sm font-medium text-ink shrink-0">Duration</label>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <select
                  value={durHr}
                  onChange={(e) => setDurHr(Number(e.target.value))}
                  className="w-16 h-10 px-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition bg-white"
                >
                  {Array.from({ length: 13 }).map((_, h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-sm text-muted">hr</span>
                <select
                  value={durMin}
                  onChange={(e) => setDurMin(Number(e.target.value))}
                  className="w-16 h-10 px-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-zoom-blue/30 transition bg-white"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                <span className="text-sm text-muted">min</span>
                {errors.duration && <p className="text-xs text-danger ml-2">{errors.duration}</p>}
              </div>
            </div>

            {/* Time Zone */}
            <div className="flex gap-8 items-start">
              <label className="w-36 pt-2 text-sm font-medium text-ink shrink-0">Time Zone</label>
              <div className="flex-1 min-w-0">
                <div className="h-10 px-3 rounded-lg border border-line bg-[#F5F6FA] text-sm text-muted flex items-center gap-2 select-none">
                  <Clock className="h-4 w-4" />
                  {timeZoneLabel}
                </div>
                <p className="text-xs text-muted mt-1">Times selected are in your browser&apos;s local zone.</p>
              </div>
            </div>

            {/* Meeting ID */}
            <div className="flex gap-8 items-start">
              <label className="w-36 pt-2 text-sm font-medium text-ink shrink-0">Meeting ID</label>
              <div className="flex-1 min-w-0">
                <label className="flex items-center gap-3 h-10 px-3 rounded-lg border border-line bg-[#F5F6FA] text-sm text-ink select-none cursor-default">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="accent-zoom-blue"
                  />
                  Generate Automatically
                </label>
              </div>
            </div>

            {/* Error from submit */}
            {errors.submit && (
              <div className="bg-[#FDE8E8] border border-danger rounded-lg px-4 py-3 text-sm text-danger">
                {errors.submit}
              </div>
            )}

            {/* Past start inline error */}
            {errors.start && (
              <div className="bg-[#FDE8E8] border border-danger rounded-lg px-4 py-3 text-sm text-danger">
                {errors.start}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-6 py-2.5 text-sm font-bold text-ink hover:bg-app transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-zoom-blue text-white px-6 py-2.5 text-sm font-bold hover:bg-zoom-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
