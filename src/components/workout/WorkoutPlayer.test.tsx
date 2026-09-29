import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const exercises = {
  mood: "Ansiosa",
  exercises: [
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 45 },
  ],
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("mood=Ansiosa"),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(exercises) }),
    ),
  );
});

import { WorkoutPlayer } from "./WorkoutPlayer";

describe("WorkoutPlayer", () => {
  it("muestra el primer ejercicio y permite avanzar", async () => {
    render(<WorkoutPlayer />);
    expect(await screen.findByText("Respiración profunda")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /siguiente movimiento/i }));
    expect(await screen.findByText("Mariposa sentado")).toBeInTheDocument();
  });

  it("pausa y reanuda", async () => {
    render(<WorkoutPlayer />);
    await screen.findByText("Respiración profunda");
    fireEvent.click(screen.getByRole("button", { name: /pausar/i }));
    expect(screen.getByRole("button", { name: /reanudar/i })).toBeInTheDocument();
  });
});
