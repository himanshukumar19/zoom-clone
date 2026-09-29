import { describe, expect, it } from "vitest";

import { parseMeetingInput } from "./parseMeetingInput";

const CODE = "1234567890";

describe("parseMeetingInput", () => {
  it("accepts spaced, raw, and invite-link forms as the same code", () => {
    expect(parseMeetingInput("123 456 7890")).toBe(CODE);
    expect(parseMeetingInput("1234567890")).toBe(CODE);
    expect(parseMeetingInput("http://localhost:3000/join/1234567890")).toBe(
      CODE,
    );
  });

  it("trims surrounding whitespace", () => {
    expect(parseMeetingInput("  1234567890  \n")).toBe(CODE);
  });

  it("accepts links with query params, hash, or spaced code", () => {
    expect(
      parseMeetingInput("https://app.example.com/join/1234567890?x=1#top"),
    ).toBe(CODE);
    expect(
      parseMeetingInput("https://app.example.com/join/123%20456%207890"),
    ).toBe(CODE);
  });

  it("fails cleanly on garbage, short codes, and bad links", () => {
    expect(() => parseMeetingInput("")).toThrow();
    expect(() => parseMeetingInput("   ")).toThrow();
    expect(() => parseMeetingInput("hello")).toThrow();
    expect(() => parseMeetingInput("12345")).toThrow();
    expect(() => parseMeetingInput("12345678901")).toThrow();
    expect(() => parseMeetingInput("123-456-7890x")).toThrow();
    expect(() =>
      parseMeetingInput("https://app.example.com/join/abc"),
    ).toThrow();
    expect(() => parseMeetingInput("https://app.example.com/join/123")).toThrow();
  });
});
