import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlantGrowth } from "./PlantGrowth";

describe("PlantGrowth", () => {
  it("renderiza la planta con accesibilidad", () => {
    render(<PlantGrowth stage={0} />);
    expect(screen.getByRole("img", { name: /planta/i })).toBeInTheDocument();
  });

  it("muestra la flor cuando alcanza la etapa máxima", () => {
    render(<PlantGrowth stage={12} />);
    expect(screen.getByRole("img", { name: /planta/i })).toBeInTheDocument();
    // grupo de pétalos solo visible en etapa bloom
    expect(screen.getByTestId("bloom")).toBeInTheDocument();
  });

  it("no muestra la flor al inicio", () => {
    render(<PlantGrowth stage={2} />);
    expect(screen.queryByTestId("bloom")).not.toBeInTheDocument();
  });
});
