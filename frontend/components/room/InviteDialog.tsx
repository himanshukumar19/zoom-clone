"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export function InviteDialog({
  open,
  onClose,
  inviteLink,
  codeDisplay,
}: {
  open: boolean;
  onClose: () => void;
  inviteLink: string;
  codeDisplay: string;
}) {
  const [copied, setCopied] = useState(false);
  const pushToast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      pushToast("success", "Invite link copied.");
    } catch {
      pushToast("error", "Failed to copy link.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite Link">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Meeting ID{" "}
          <span className="font-mono font-bold text-ink">{codeDisplay}</span>
        </p>
        <div className="flex items-center gap-2 rounded-lg border bg-app px-3 py-2.5">
          <code className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
            {inviteLink}
          </code>
          <button
            onClick={handleCopy}
            aria-label="Copy invite link"
            className="inline-flex items-center gap-1.5 rounded-md bg-zoom-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-zoom-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted">
          Anyone with this link can join your meeting.
        </p>
      </div>
    </Modal>
  );
}
