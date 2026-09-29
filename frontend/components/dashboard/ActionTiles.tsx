"use client";

import { useRouter } from "next/navigation";
import { Video, Plus, CalendarDays } from "lucide-react";
import { createInstantMeeting } from "@/lib/api";
import { saveParticipantId } from "@/lib/session";
import { useToast } from "@/components/ui/Toast";

// Compact icon-button-with-label-below, matching Zoom web client reference (image 03).
type Variant = "new" | "join" | "schedule";

const variantBg: Record<Variant, string> = {
  new: "bg-zoom-orange",
  join: "bg-zoom-blue",
  schedule: "bg-zoom-blue",
};

type ActionTileProps = {
  label: string;
  icon: React.ReactNode;
  variant: Variant;
  onClick?: () => void;
  disabled?: boolean;
};

export function ActionTile({
  label,
  icon,
  variant,
  onClick,
  disabled = false,
}: ActionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex flex-col items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {/* Rounded square icon container */}
      <span
        className={`flex h-[72px] w-[72px] items-center justify-center rounded-[20px] shadow-md transition-all duration-150 group-hover:brightness-110 group-active:scale-95 ${variantBg[variant]}`}
      >
        {icon}
      </span>
      {/* Label below */}
      <span className="text-xs font-medium text-ink leading-tight">{label}</span>
    </button>
  );
}

export function ActionTiles() {
  const router = useRouter();
  const pushToast = useToast();

  const handleNew = async () => {
    try {
      const result = await createInstantMeeting();
      saveParticipantId(result.meeting.meeting_code, result.participant.id);
      router.push(`/meeting/${result.meeting.meeting_code}`);
    } catch (e: unknown) {
      const msg =
        (e as { detail?: string; message?: string }).detail ||
        (e as { detail?: string; message?: string }).message ||
        "Failed to start meeting.";
      pushToast("error", msg);
    }
  };

  return (
    <nav
      aria-label="Meeting actions"
      className="flex items-center justify-center gap-10"
    >
      <ActionTile
        label="New meeting"
        variant="new"
        icon={<Video className="h-8 w-8 text-white" strokeWidth={2} />}
        onClick={handleNew}
      />
      <ActionTile
        label="Join"
        variant="join"
        icon={<Plus className="h-8 w-8 text-white" strokeWidth={2.5} />}
        onClick={() => router.push("/join")}
      />
      <ActionTile
        label="Schedule"
        variant="schedule"
        icon={<CalendarDays className="h-8 w-8 text-white" strokeWidth={2} />}
        onClick={() => router.push("/schedule")}
      />
    </nav>
  );
}
