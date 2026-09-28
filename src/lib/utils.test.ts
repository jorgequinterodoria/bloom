import { describe, expect, it } from "vitest";
import {
  MAX_PLANT_STAGE,
  isWeekendDay,
  nextStage,
  plantState,
} from "./utils";

describe("nextStage", () => {
  it("incrementa de a uno", () => {
    expect(nextStage(3)).toBe(4);
  });
  it("nunca supera el máximo", () => {
    expect(nextStage(MAX_PLANT_STAGE)).toBe(MAX_PLANT_STAGE);
    expect(nextStage(MAX_PLANT_STAGE - 1)).toBe(MAX_PLANT_STAGE);
  });
});

describe("plantState", () => {
  it("semilla al inicio", () => {
    expect(plantState(0)).toBe("seed");
    expect(plantState(2)).toBe("seed");
  });
  it("brote, hojas y flor según umbrales", () => {
    expect(plantState(3)).toBe("sprout");
    expect(plantState(6)).toBe("leaves");
    expect(plantState(10)).toBe("bloom");
    expect(plantState(MAX_PLANT_STAGE)).toBe("bloom");
  });
});

describe("isWeekendDay", () => {
  it("sábado y domingo son fin de semana", () => {
    expect(isWeekendDay(new Date("2026-09-26T12:00:00"))).toBe(true); // sáb
    expect(isWeekendDay(new Date("2026-09-27T12:00:00"))).toBe(true); // dom
  });
  it("entre semana no", () => {
    expect(isWeekendDay(new Date("2026-09-28T12:00:00"))).toBe(false); // lun
    expect(isWeekendDay(new Date("2026-09-30T12:00:00"))).toBe(false); // mié
  });
});
