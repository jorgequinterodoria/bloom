import { describe, expect, it } from "vitest";
import { buildRecommendation } from "./recommendations";

describe("buildRecommendation", () => {
  it("prioriza tensión alta", () => {
    expect(buildRecommendation({ energy: 4, stress: 5 }).priority).toBe("stress");
  });
  it("acorta la sesión con energía baja", () => {
    expect(buildRecommendation({ energy: 1, stress: 2, preferredDuration: 25 }).duration).toBe(15);
  });
  it("detecta una tendencia de estrés al alza", () => {
    const recommendation = buildRecommendation({ energy: 3, stress: 3, recentStress: [4, 3, 2] });
    expect(recommendation.priority).toBe("stress");
  });
  it("usa más actividad con energía alta", () => {
    expect(buildRecommendation({ energy: 5, stress: 1 }).intensity).toBe("activadora");
  });
});
