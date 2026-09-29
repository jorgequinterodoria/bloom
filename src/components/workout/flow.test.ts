import { describe, expect, it } from "vitest";
import { nextIndex, timeLeftAfterTick } from "./flow";

describe("nextIndex", () => {
  it("avanza al siguiente ejercicio", () => {
    expect(nextIndex(0, 4)).toBe(1);
  });
  it("al final devuelve null (fin del flujo)", () => {
    expect(nextIndex(3, 4)).toBeNull();
    expect(nextIndex(0, 0)).toBeNull();
  });
});

describe("timeLeftAfterTick", () => {
  it("descuenta 1s", () => {
    expect(timeLeftAfterTick(10)).toBe(9);
  });
  it("en 0 devuelve 0", () => {
    expect(timeLeftAfterTick(0)).toBe(0);
    expect(timeLeftAfterTick(1)).toBe(0);
  });
});
