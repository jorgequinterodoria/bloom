import { describe, expect, it } from "vitest";
import {
  MAX_PLANT_STAGE,
  isWeekendDay,
  nextStage,
  plantState,
  startOfToday,
  todayKey,
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

describe("todayKey", () => {
  it("cero-pad de mes y día (month+1)", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("startOfToday", () => {
  it("devuelve un Date en el mismo día calendario que su input", () => {
    const input = new Date(2026, 8, 28, 15, 45, 30, 123);
    const result = startOfToday(input);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(input.getFullYear());
    expect(result.getMonth()).toBe(input.getMonth());
    expect(result.getDate()).toBe(input.getDate());
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
  it("no muta su input", () => {
    const input = new Date(2026, 8, 28, 15, 45, 30, 123);
    const snapshot = input.getTime();
    startOfToday(input);
    expect(input.getTime()).toBe(snapshot);
  });
});
