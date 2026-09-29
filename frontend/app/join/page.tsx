"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { parseMeetingInput } from "@/lib/parseMeetingInput";
import { getMeeting } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/Wordmark";

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
    <div className="min-h-screen bg-white text-ink">
      {/* Top bar consistent with shared layout (spec §8.2 / D19) */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue rounded-md">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <a href="#" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Support</a>
          <Link href="/schedule" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Schedule</Link>
          <Link href="/join" className="text-zoom-blue">Join</Link>
          <a href="#" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Host</a>
          <a href="#" className="hover:text-zoom-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue">Web App</a>
        </nav>
      </header>

      <main className="flex flex-col items-center px-6 pt-28 pb-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black tracking-tight text-ink text-center mb-2">Join Meeting</h1>
          <p className="text-sm text-muted text-center mb-8">Enter a Meeting ID or invite link.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              id="join-input"
              label="Meeting ID or Invite Link"
              placeholder="Enter Meeting ID or Invite Link"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              autoComplete="off"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
              aria-label="Join meeting"
            >
              <span>Join</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>
      </main>

      <footer className="border-t border-line bg-app py-4 text-center text-xs text-muted">
        © 2026 zoom-clone (assignment project). All rights reserved.
      </footer>
    </div>
  );
}
