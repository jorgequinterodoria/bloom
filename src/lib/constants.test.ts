import { describe, expect, it } from "vitest";
import { EXERCISE_LIBRARY, MOODS, findFlow } from "./constants";

describe("MOODS", () => {
  it("tiene los 4 ánimos del brief", () => {
    expect(MOODS.map((m) => m.name)).toEqual([
      "Estresada",
      "Ansiosa",
      "Energética",
      "Sin motivación",
    ]);
  });
});

describe("flujos de ejercicios", () => {
  it("cada ánimo tiene 3-4 ejercicios de 30-90s", () => {
    for (const mood of MOODS) {
      const flow = findFlow(mood.name);
      expect(flow.length).toBeGreaterThanOrEqual(3);
      expect(flow.length).toBeLessThanOrEqual(4);
      for (const ex of flow) {
        expect(ex.durationSeconds).toBeGreaterThanOrEqual(30);
        expect(ex.durationSeconds).toBeLessThanOrEqual(90);
      }
    }
  });

  it("EXERCISE_LIBRARY cubre exactamente los 4 ánimos", () => {
    expect(Object.keys(EXERCISE_LIBRARY).sort()).toEqual(
      [...MOODS.map((m) => m.name)].sort(),
    );
  });

  it("findFlow devuelve [] para un ánimo desconocido", () => {
    expect(findFlow("No existe")).toEqual([]);
  });

  it("los ejercicios no se repiten dentro de un flujo y tienen nombre", () => {
    for (const mood of MOODS) {
      const flow = findFlow(mood.name);
      expect(new Set(flow.map((e) => e.name)).size).toBe(flow.length);
      for (const ex of flow) expect(ex.name.trim()).not.toBe("");
    }
  });
});
