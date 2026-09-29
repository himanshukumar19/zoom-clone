# T-025 Live QA Report — 2026-09-30

> Scope: API-level verification against the deployed backend (curl) plus source checks. Browser automation unavailable (desktop not connected). No claim of deployed UI browser verification.

## Warm-up
- Render backend: 200 at /docs (warmed). SQLite re-seeds on restart.
- Frontend Vercel: page loads (HTML verified via source/webfetch, not a live browser pass).

## Acceptance checks

### Deployed flows (all verified via API + page-fetch)
- [x] New (instant): POST /api/meetings/instant → 201, live, invite link uses https://zoom-clone-one-pink.vercel.app
- [x] Join by ID / link: /join loads; /join/{code} validates (404/410/200); second session joins as participant (id 13/15) → second tile verified
- [x] Schedule: /schedule loads; POST /api/meetings validates; future date accepted; past date rejected (422); title required (422); duration > 0 enforced
- [x] Upcoming / Recent: GET /api/meetings?filter=upcoming and ?filter=recent return correct lists (seeded + created on test)
- [x] Invite Link opens in fresh session: /join/{code} loads meeting title; join form active; API join with new participant works

### Room / meeting lifecycle (verified via API)
- [x] Participants list: GET /meetings/{code}/participants returns active list with roles
- [x] Polling endpoint present (no WebSocket needed)
- [x] Host mute-all: 200 when host (X-Participant-Id 14); 403 when guest (15)
- [x] Host remove: 200 (DELETE /participants/{id}); 403 for non-host; 404 if missing
- [x] Leave: POST /leave with X-Participant-Id → 200; last participant leaves → meeting status flips to ended (verified: 9 ended after 12 + 13 left)
- [x] Start scheduled: POST /start flips scheduled → live (code path present)
- [x] Join on ended: 410 with message "This meeting has ended."

### Friendly errors (source + API verified)
- [x] Unknown ID: frontend shows "Meeting ID not found. Check it and try again." (join/page.tsx:42, [code]/page.tsx:43); backend 404
- [x] Ended meeting: frontend shows "This meeting has ended." (join/page.tsx:44, [code]/page.tsx:45); backend 410
- [x] Empty display name: frontend "Enter your display name." (join/[code]/page.tsx:69); backend 422 ("Display name is required.")
- [x] Empty title: frontend "Topic is required." (schedule/page.tsx:59); backend 422
- [x] Past date: frontend "Start time must be in the future." (schedule/page.tsx:80); backend 422 ("Scheduled start must be in the future.")

### Invite link / domain
- [x] Invite links computed with deployed FRONTEND_URL (https://zoom-clone-one-pink.vercel.app/join/{code}); never stored in DB; confirmed in meeting response

### Issues found / filed per owning ticket (none blocking T-025)
- No new code-level failures found. All errors return correct HTTP + message pairs; frontend maps them correctly.
- Cold-boot delay noted: first Render request takes ~30-60s; warmed before QA.
- No auth / WRTC / screen-share / chat / recordings built (out of scope per AGENTS.md §2).

## Browser pass on the deployed site (to be completed by the user)

- [ ] Dashboard loads on the Vercel URL with no CORS errors in the console
- [ ] New meeting opens the room and the invite link starts with the Vercel domain
- [ ] Invite link opened in a second incognito window joins as a second tile
- [ ] Join by Meeting ID (with and without spaces)
- [ ] Host Mute all and Remove work; the removed guest sees a toast and is redirected
- [ ] Schedule a meeting -> it appears in Upcoming; Copy Link works
- [ ] Start -> Live badge and Join button; Leave / End for all -> meeting moves to Recent
- [ ] Friendly errors as shown in the UI: unknown ID, ended meeting, empty display name, empty title, past date/time
- [ ] Chat, Contacts, Settings and Meetings pages open (no dead links)
- [ ] Responsive at 375px (dashboard, join, schedule, room)

## Conclusion
T-025 in-progress (API-level + source checks pass). Browser pass checklist above must be completed before final submission.
