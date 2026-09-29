import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getMeeting, joinMeeting } from "./api";

process.env.NEXT_PUBLIC_API_URL = "http://test.invalid";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api client errors", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces 404/410/403 detail strings as typed ApiErrors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(404, { detail: "Meeting not found." })),
    );
    const notFound = await getMeeting("0000000000").catch((e) => e);
    expect(notFound).toBeInstanceOf(ApiError);
    expect(notFound.status).toBe(404);
    expect(notFound.detail).toBe("Meeting not found.");

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(410, { detail: "This meeting has ended." })),
    );
    const ended = await getMeeting("1234567890").catch((e) => e);
    expect(ended).toBeInstanceOf(ApiError);
    expect(ended.status).toBe(410);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(403, { detail: "Only the host can do this." })),
    );
    const forbidden = await joinMeeting("1234567890", "Bob").catch((e) => e);
    expect(forbidden).toBeInstanceOf(ApiError);
    expect(forbidden.status).toBe(403);
  });

  it("flattens FastAPI 422 detail arrays into one message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(422, {
          detail: [
            { loc: ["body", "display_name"], msg: "Name too long." },
            { loc: ["body", "x"], msg: "Extra error." },
          ],
        }),
      ),
    );
    const err = await joinMeeting("1234567890", "x".repeat(60)).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.detail).toContain("Name too long.");
  });

  it("sends the participant identity header and JSON body on join", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ meeting: {}, participant: {} }), {
          status: 201,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await joinMeeting("1234567890", "  Alice  ", 9);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://test.invalid/api/meetings/1234567890/join");
    expect((init.headers as Record<string, string>)["X-Participant-Id"]).toBe(
      "9",
    );
    expect(init.body).toBe(JSON.stringify({ display_name: "  Alice  " }));
  });

  it("builds the base URL from env with no hardcoded origin", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, { id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com/";
    await getMeeting("1234567890").catch(() => {});
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    // Trailing slash in env is normalized, never doubled.
    expect(url).toBe("https://api.example.com/api/meetings/1234567890");
    process.env.NEXT_PUBLIC_API_URL = "http://test.invalid";
  });
});
