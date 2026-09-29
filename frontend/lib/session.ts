/** Room identity helper (ADR-0002, T-010). NOT authentication.
 *
 * After joining, the frontend remembers its numeric participant id in
 * sessionStorage, keyed by meeting code, and sends it as X-Participant-Id
 * on room actions. The backend uses it only to find the participant row
 * and enforce host-only rules. Clearing on leave/removed keeps stale
 * identities from leaking into later joins.
 */

const KEY_PREFIX = "zoom-clone:participant:";

/** Strip spaces so "123 456 7890" and "1234567890" share one entry. */
function normalizeCode(code: string): string {
  return code.replace(/\s+/g, "");
}

function keyFor(code: string): string {
  return `${KEY_PREFIX}${normalizeCode(code)}`;
}

function storage(): Storage | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  return window.sessionStorage;
}

export function saveParticipantId(code: string, participantId: number): void {
  storage()?.setItem(keyFor(code), String(participantId));
}

export function loadParticipantId(code: string): number | null {
  const raw = storage()?.getItem(keyFor(code));
  if (raw == null || raw === "") {
    return null;
  }
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export function clearParticipantId(code: string): void {
  storage()?.removeItem(keyFor(code));
}
