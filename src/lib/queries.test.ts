import { describe, expect, it, vi } from "vitest";
import { resolveDayKey } from "./db/queries";
import { todayKey } from "./utils";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

describe("resolveDayKey", () => {
  it("acepta YYYY-MM-DD válido", () => {
    expect(resolveDayKey("2099-01-01")).toBe("2099-01-01");
  });
  it("cae a todayKey con entradas inválidas o ausentes", () => {
    expect(resolveDayKey(null)).toBe(todayKey());
    expect(resolveDayKey(undefined)).toBe(todayKey());
    expect(resolveDayKey("mañana")).toBe(todayKey());
    expect(resolveDayKey("2099-1-1")).toBe(todayKey());
  });
});
