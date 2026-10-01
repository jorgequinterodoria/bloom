import { describe, expect, it } from "vitest";
import { answerCoach, buildCoachBrief, type CoachContext } from "@/lib/coach";
import { localizeCoachReply, localizeStoredCoachMessage, translateCoachMessage } from "@/lib/coach-i18n";

const context: CoachContext = {
  latest: { dayKey: "2026-10-01", mood: "Estresada", energy: 2, stress: 5, note: "Mucho trabajo" },
  recent: [
    { dayKey: "2026-10-01", mood: "Estresada", energy: 2, stress: 5 },
    { dayKey: "2026-09-30", mood: "Ansiosa", energy: 3, stress: 4 },
    { dayKey: "2026-09-29", mood: "Ansiosa", energy: 3, stress: 3 },
  ],
  sessions: [{ beforeStress: 5, afterStress: 3, beforeEnergy: 2, afterEnergy: 3, durationSeconds: 600, dayKey: "2026-09-30" }],
  preferredDuration: 15,
  focus: "stress",
};

describe("Bloom Coach", () => {
  it("prioritizes grounding when stress is high", () => {
    const result = buildCoachBrief(context);
    expect(result.mood).toBe("ground");
    expect(result.title).toContain("bajar");
  });

  it("answers a stress request without external dependencies", () => {
    const result = answerCoach("Necesito bajar el estrés", context);
    expect(result.mood).toBe("ground");
    expect(result.body.length).toBeGreaterThan(30);
  });

  it("recognizes progress questions", () => {
    const result = answerCoach("¿Cómo voy progresando?", context);
    expect(result.body).toContain("sesiones");
  });

  it("localizes the personalized brief and its metric reason", () => {
    const result = localizeCoachReply(buildCoachBrief(context), "en");

    expect(result.title).toBe("Today is a good day to slow things down.");
    expect(result.reason).toBe("Bloom noticed your stress rising in recent check-ins.");
    expect(result.action).toBe("Try 15 gentle minutes");
  });

  it("recognizes an English stress request and localizes the answer", () => {
    const reply = answerCoach("I need to lower my stress", context);

    expect(reply.id).toBe("answer.stress");
    expect(localizeCoachReply(reply, "fr").title).toBe("Allégeons un peu ce moment.");
  });

  it("localizes known assistant messages already stored in the conversation", () => {
    const reply = answerCoach("Necesito bajar el estrés", context);

    expect(localizeStoredCoachMessage(reply.body, "it")).toContain("Fai una pausa di due minuti");
  });

  it("provides Coach interface labels in every supported language", () => {
    const titles = (["es", "fr", "pt", "en", "it"] as const).map((locale) => translateCoachMessage("coachTitle", locale));

    expect(titles).toEqual(["Habla con Bloom", "Parlez avec Bloom", "Converse com Bloom", "Talk with Bloom", "Parla con Bloom"]);
    expect(new Set(titles).size).toBe(5);
  });
});
