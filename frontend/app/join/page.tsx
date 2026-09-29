"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseMeetingInput } from "@/lib/parseMeetingInput";
import { getMeeting } from "@/lib/api";

export default function JoinPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = input.trim();
  const canSubmit = trimmed.length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!trimmed) return;

    let code: string;
    try {
      code = parseMeetingInput(trimmed);
    } catch (err) {
      setError(
        (err as { message?: string }).message ||
          "Enter a 10-digit Meeting ID or a valid invite link.",
      );
      return;
    }

    setLoading(true);
    try {
      await getMeeting(code);
      router.push(`/join/${code}`);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const msg = (err as { detail?: string }).detail || "Something went wrong.";
      if (status === 404) {
        setError("Meeting ID not found. Check it and try again.");
      } else if (status === 410) {
        setError("This meeting has ended.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header — matches reference image 04: wordmark left, nav links right */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <Link
          href="/"
          aria-label="zoom-clone home"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue rounded"
        >
          {/* Zoom-style wordmark: bold blue 'zoom' */}
          <span className="font-black lowercase tracking-tight text-zoom-blue text-2xl">
            zoom
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-ink">
          <a href="#" className="hover:text-zoom-blue transition-colors">
            Support
          </a>
          <Link href="/schedule" className="hover:text-zoom-blue transition-colors">
            Schedule
          </Link>
          <Link href="/join" className="text-zoom-blue">
            Join
          </Link>
          <a href="#" className="hover:text-zoom-blue transition-colors">
            Host
          </a>
          <a href="#" className="hover:text-zoom-blue transition-colors">
            Web App
          </a>
        </nav>
      </header>

      {/* Main — centered form matching reference image 04 */}
      <main className="flex flex-1 flex-col items-center pt-24 px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink text-center mb-8">
            Join Meeting
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            {/* Label */}
            <label
              htmlFor="join-input"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Meeting ID or Personal Link Name
            </label>

            {/* Input — blue border when focused, matching reference */}
            <input
              id="join-input"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter Meeting ID or Personal Link Name"
              autoComplete="off"
              autoFocus
              className={`w-full h-11 px-3 rounded-lg border text-sm outline-none transition-all ${
                error
                  ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger/30"
                  : "border-zoom-blue focus:border-zoom-blue focus:ring-2 focus:ring-zoom-blue/20"
              }`}
            />

            {/* Inline error */}
            {error && (
              <p className="mt-2 text-xs text-danger" role="alert">
                {error}
              </p>
            )}

            {/* Join button — gray when disabled (no input), matching reference */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`mt-3 w-full h-11 rounded-lg text-sm font-semibold transition-colors ${
                canSubmit
                  ? "bg-zoom-blue text-white hover:bg-zoom-blue-dark"
                  : "bg-[#E4E7EC] text-[#98A2B3] cursor-not-allowed"
              }`}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </form>

          {/* Secondary link — matches reference */}
          <div className="mt-8 text-center">
            <a
              href="#"
              className="text-sm text-zoom-blue hover:underline"
            >
              Join a meeting from an H.323/SIP room system
            </a>
          </div>
        </div>
      </main>

      {/* Footer — matches reference image 04 */}
      <footer className="py-5 text-center text-xs text-muted border-t border-line">
        © 2026 zoom-clone (assignment project). All rights reserved.
      </footer>
    </div>
  );
}
