/** Shared API types (T-010). Mirror of backend `app/schemas/meeting.py`. */

export interface Host {
  id: number;
  name: string;
}

export type MeetingType = "instant" | "scheduled";
export type MeetingStatus = "scheduled" | "live" | "ended";

export interface Meeting {
  id: number;
  /** Raw 10 digits, e.g. "1234567890". */
  meeting_code: string;
  /** Spaced for display, e.g. "123 456 7890". */
  meeting_code_display: string;
  title: string;
  description: string | null;
  type: MeetingType;
  status: MeetingStatus;
  /** UTC ISO string with Z suffix, or null for instant meetings. */
  scheduled_start: string | null;
  duration_minutes: number | null;
  /** Computed invite link, never stored server-side. */
  invite_link: string;
  host: Host;
}

export type ParticipantRole = "host" | "participant";

export interface Participant {
  id: number;
  meeting_id: number;
  display_name: string;
  role: ParticipantRole;
  is_muted: boolean;
  is_removed: boolean;
  joined_at: string;
}

export interface MeetingWithParticipant {
  meeting: Meeting;
  participant: Participant;
}

export interface DefaultUser {
  id: number;
  name: string;
  email: string;
}

export type MeetingListFilter = "upcoming" | "recent";

export interface ScheduleMeetingInput {
  title: string;
  description?: string;
  /** UTC ISO string. */
  scheduled_start: string;
  duration_minutes: number;
}
