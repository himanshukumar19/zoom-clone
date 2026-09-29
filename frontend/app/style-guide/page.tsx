"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Wordmark } from "@/components/Wordmark";

const tokens: Array<{ name: string; value: string; textDark?: boolean }> = [
  { name: "--zoom-blue", value: "#0B5CFF", textDark: false },
  { name: "--zoom-blue-dark", value: "#0A4FD9", textDark: false },
  { name: "--zoom-orange", value: "#FF6A1A", textDark: false },
  { name: "--text", value: "#232333", textDark: false },
  { name: "--text-muted", value: "#6E7085", textDark: false },
  { name: "--border", value: "#DDE1E8", textDark: true },
  { name: "--bg-app", value: "#EEF1F6", textDark: true },
  { name: "--bg-sidebar", value: "#F5F6FA", textDark: true },
  { name: "--bg-nav-dark", value: "#0B1329", textDark: false },
  { name: "--info-bg", value: "#EEF5FF", textDark: true },
  { name: "--danger", value: "#E02828", textDark: false },
  { name: "room bg", value: "#1C1C1E", textDark: false },
  { name: "room toolbar", value: "#232326", textDark: false },
];

// Sanity page proving tokens, Lato, and primitives render (T-009).
// Client-rendered; makes no backend calls so `next build` needs no backend.
export default function StyleGuide() {
  const [modalOpen, setModalOpen] = useState(false);
  const pushToast = useToast();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 bg-white px-4 py-10">
      <header className="flex flex-col gap-2">
        <Wordmark />
        <h1 className="text-2xl font-black text-ink">Style guide</h1>
        <p className="text-muted">
          Tokens from plan §8.0. Font: Lato via next/font. All components are
          original work — no copied Zoom assets.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Tokens</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {tokens.map((t) => (
            <div
              key={t.name}
              className="overflow-hidden rounded-lg border border-line"
            >
              <div className="h-14" style={{ background: t.value }} />
              <div className="px-2 py-1.5 text-xs">
                <div className="font-bold text-ink">{t.name}</div>
                <div className="text-muted">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Leave</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Inputs</h2>
        <Input
          label="Meeting ID or Invite Link"
          name="demo-input"
          placeholder="Enter Meeting ID or Invite Link"
        />
        <Input
          label="With error"
          name="demo-error"
          defaultValue="xyz"
          error="Meeting ID not found. Check it and try again."
        />
        <Input
          label="Disabled"
          name="demo-disabled"
          placeholder="Disabled"
          disabled
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Selects</h2>
        <Select label="Duration (hr)" name="demo-hr" defaultValue="0">
          <option value="0">0 hr</option>
          <option value="1">1 hr</option>
        </Select>
        <Select label="Disabled" name="demo-sel-disabled" disabled>
          <option>AM</option>
        </Select>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Modal & Toast</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="secondary" onClick={() => pushToast("info", "Info toast")}>
            Info toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => pushToast("success", "Invite link copied.")}
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => pushToast("error", "This meeting has ended.")}
          >
            Error toast
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Invite link"
        >
          <p className="text-sm text-muted">
            Modal closes on overlay click or Escape. Real invite content lands
            with the meeting flows.
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setModalOpen(false)}>Done</Button>
          </div>
        </Modal>
      </section>
    </main>
  );
}
