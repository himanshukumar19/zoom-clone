import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearParticipantId,
  loadParticipantId,
  saveParticipantId,
} from "./session";

// Minimal in-memory sessionStorage behind `window` (vitest runs in node).
function installMemoryStorage() {
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    sessionStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
}

describe("participant session helper", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installMemoryStorage();
  });

  it("stores, loads, and clears the identity per meeting code", () => {
    expect(loadParticipantId("1234567890")).toBeNull();
    saveParticipantId("1234567890", 42);
    expect(loadParticipantId("1234567890")).toBe(42);
    clearParticipantId("1234567890");
    expect(loadParticipantId("1234567890")).toBeNull();
  });

  it("treats spaced and raw codes as the same entry", () => {
    saveParticipantId("123 456 7890", 7);
    expect(loadParticipantId("1234567890")).toBe(7);
  });

  it("keeps identities isolated between meetings", () => {
    saveParticipantId("1111111111", 1);
    saveParticipantId("2222222222", 2);
    expect(loadParticipantId("1111111111")).toBe(1);
    clearParticipantId("1111111111");
    expect(loadParticipantId("1111111111")).toBeNull();
    expect(loadParticipantId("2222222222")).toBe(2);
  });

  it("returns null for corrupt stored values", () => {
    window.sessionStorage.setItem("zoom-clone:participant:1234567890", "NaN!");
    expect(loadParticipantId("1234567890")).toBeNull();
  });
});
