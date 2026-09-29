/** Typed API client over NEXT_PUBLIC_API_URL (T-010, plan section 6).
 *
 * Every error surfaces as ApiError carrying the HTTP status so the UI can
 * message on it: 404 unknown code, 410 ended meeting, 422 validation,
 * 403 non-host. The backend envelope is `{ "detail": "..." }`; a 422 from
 * FastAPI carries a detail *array*, which is flattened into one string.
 *
 * No backend origin is hardcoded here: the base URL always comes from
 * NEXT_PUBLIC_API_URL (see frontend/.env.example).
 */

import type {
  DefaultUser,
  Meeting,
  MeetingListFilter,
  MeetingWithParticipant,
  Participant,
  ScheduleMeetingInput,
} from "@/types";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to frontend/.env.local (see .env.example).",
    );
  }
  return base.replace(/\/+$/, "");
}

async function toApiError(res: Response): Promise<ApiError> {
  let detail = `Request failed (${res.status}).`;
  try {
    const body: unknown = await res.json();
    const raw = (body as { detail?: unknown } | null)?.detail;
    if (typeof raw === "string" && raw) {
      detail = raw;
    } else if (Array.isArray(raw)) {
      // FastAPI 422: [{ loc, msg, type }, ...] -> "msg; msg".
      const msgs = raw
        .map((item) =>
          typeof item === "string"
            ? item
            : typeof (item as { msg?: unknown })?.msg === "string"
              ? (item as { msg: string }).msg
              : null,
        )
        .filter((m): m is string => m != null && m !== "");
      if (msgs.length > 0) {
        detail = msgs.join(" ");
      }
    }
  } catch {
    // Non-JSON error body: keep the default message.
  }
  return new ApiError(res.status, detail);
}

interface RequestOptions extends RequestInit {
  /** Sent as the X-Participant-Id header (room identity, ADR-0002). */
  participantId?: number | null;
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { participantId, headers, ...init } = options ?? {};
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(participantId != null
        ? { "X-Participant-Id": String(participantId) }
        : {}),
      ...headers,
    },
  });
  if (res.ok) {
    if (res.status === 204) {
      return undefined as T;
    }
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
  throw await toApiError(res);
}

function post<T>(path: string, body?: unknown, participantId?: number | null) {
  return request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    participantId,
  });
}

/** GET /api/me — the seeded default user (navbar placeholder, no auth). */
export function getCurrentUser(): Promise<DefaultUser> {
  return request<DefaultUser>("/api/me");
}

/** POST /api/meetings/instant — live meeting + host participant. */
export function createInstantMeeting(): Promise<MeetingWithParticipant> {
  return post<MeetingWithParticipant>("/api/meetings/instant");
}

/** POST /api/meetings — schedule for later (backend returns the meeting). */
export function scheduleMeeting(input: ScheduleMeetingInput): Promise<Meeting> {
  return post<Meeting>("/api/meetings", input);
}

/** GET /api/meetings?filter=upcoming|recent — dashboard lists. */
export function listMeetings(filter: MeetingListFilter): Promise<Meeting[]> {
  return request<Meeting[]>(
    `/api/meetings?filter=${encodeURIComponent(filter)}`,
  );
}

/** GET /api/meetings/{code} — validate existence (join flow). */
export function getMeeting(code: string): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${encodeURIComponent(code)}`);
}

/** POST /api/meetings/{code}/start — host starts a scheduled meeting. */
export function startMeeting(code: string): Promise<MeetingWithParticipant> {
  return post<MeetingWithParticipant>(
    `/api/meetings/${encodeURIComponent(code)}/start`,
  );
}

/** POST /api/meetings/{code}/join — join with a display name.
 *
 * The optional participantId is the stored identity for this code: the
 * backend needs it to block a removed participant rejoining on the same
 * session (spec 03).
 */
export function joinMeeting(
  code: string,
  displayName: string,
  participantId?: number | null,
): Promise<MeetingWithParticipant> {
  return post<MeetingWithParticipant>(
    `/api/meetings/${encodeURIComponent(code)}/join`,
    { display_name: displayName },
    participantId,
  );
}

/** POST /api/meetings/{code}/leave — last active leave ends the meeting. */
export function leaveMeeting(
  code: string,
  participantId: number,
): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>(
    `/api/meetings/${encodeURIComponent(code)}/leave`,
    undefined,
    participantId,
  );
}

/** GET /api/meetings/{code}/participants — active participants (5s poll). */
export function listParticipants(code: string): Promise<Participant[]> {
  return request<Participant[]>(
    `/api/meetings/${encodeURIComponent(code)}/participants`,
  );
}

/** PATCH .../participants/me — toggle own mute. */
export function setSelfMuted(
  code: string,
  participantId: number,
  isMuted: boolean,
): Promise<Participant> {
  return request<Participant>(
    `/api/meetings/${encodeURIComponent(code)}/participants/me`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_muted: isMuted }),
      participantId,
    },
  );
}

/** POST /api/meetings/{code}/mute-all — host only (403 otherwise). */
export function muteAll(
  code: string,
  participantId: number,
): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>(
    `/api/meetings/${encodeURIComponent(code)}/mute-all`,
    undefined,
    participantId,
  );
}

/** DELETE .../participants/{id} — host only (403 otherwise). */
export function removeParticipant(
  code: string,
  participantId: number,
  targetId: number,
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(
    `/api/meetings/${encodeURIComponent(code)}/participants/${targetId}`,
    { method: "DELETE", participantId },
  );
}
