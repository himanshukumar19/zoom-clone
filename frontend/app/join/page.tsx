"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { parseMeetingInput } from "@/lib/parseMeetingInput";
import { getMeeting } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <main className="min-h-screen bg-[#1C1C1E] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tight mb-2">Join a meeting</h1>
        <p className="text-sm text-muted mb-8">Enter a Meeting ID or invite link.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="join-input"
            label="Meeting ID or invite link"
            placeholder="e.g. 123 456 7890"
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
            className="w-full"
            aria-label="Join meeting"
          >
            <span>Join</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>
      </div>
    </main>
  );
}
