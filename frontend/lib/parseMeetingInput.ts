/** Pure meeting-input parser (spec 03, T-010).
 *
 * Accepts the three share formats and normalizes them to the raw 10-digit
 * code the backend stores: "123 456 7890", "1234567890", or a full invite
 * link like "{FRONTEND_URL}/join/1234567890". Anything else throws a
 * friendly Error the UI can render inline.
 */

export function parseMeetingInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter a Meeting ID or invite link.");
  }

  // Invite link: take the segment after "/join/", ignoring query/hash.
  const joinMatch = trimmed.match(/\/join\/([^\s?#]+)/i);
  if (joinMatch) {
    let segment = joinMatch[1];
    try {
      segment = decodeURIComponent(segment);
    } catch {
      // Malformed %-escapes: validate the raw segment instead.
    }
    const code = segment.replace(/[\s-]+/g, "");
    if (/^\d{10}$/.test(code)) {
      return code;
    }
    throw new Error("That invite link doesn't contain a valid Meeting ID.");
  }

  // Raw or spaced digits ("1234567890", "123 456 7890").
  const digits = trimmed.replace(/\s+/g, "");
  if (/^\d{10}$/.test(digits)) {
    return digits;
  }
  throw new Error("Enter a 10-digit Meeting ID or a valid invite link.");
}
