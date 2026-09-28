import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlantGrowth } from "./PlantGrowth";

describe("PlantGrowth", () => {
  it("renderiza la planta con accesibilidad", () => {
    render(<PlantGrowth stage={0} />);
    expect(
      screen.getByRole("img", { name: /planta de bloom — etapa 0 de 12/i }),
    ).toBeInTheDocument();
  });

  it("muestra la flor cuando alcanza la etapa máxima", () => {
    render(<PlantGrowth stage={12} />);
    expect(
      screen.getByRole("img", { name: /planta de bloom — etapa 12 de 12/i }),
    ).toBeInTheDocument();
    // grupo de pétalos solo visible en etapa bloom
    expect(screen.getByTestId("bloom")).toBeInTheDocument();
  });

  it("no muestra la flor al inicio", () => {
    render(<PlantGrowth stage={2} />);
    expect(screen.queryByTestId("bloom")).not.toBeInTheDocument();
  });

  it("refleja la etapa actual en el aria-label al cambiar de etapa", () => {
    const { rerender } = render(<PlantGrowth stage={7} />);
    expect(
      screen.getByRole("img", { name: /planta de bloom — etapa 7 de 12/i }),
    ).toBeInTheDocument();
    rerender(<PlantGrowth stage={4} />);
    expect(
      screen.getByRole("img", { name: /planta de bloom — etapa 4 de 12/i }),
    ).toBeInTheDocument();
  });

  it("oculta las hojas y conserva el brote al retroceder de etapa", () => {
    const { rerender } = render(<PlantGrowth stage={7} />);
    expect(screen.getByTestId("leaves")).toBeInTheDocument();
    rerender(<PlantGrowth stage={4} />);
    expect(screen.queryByTestId("leaves")).not.toBeInTheDocument();
    expect(screen.getByTestId("sprout")).toBeInTheDocument();
  });

  it("no muestra el brote en etapa de semilla", () => {
    render(<PlantGrowth stage={0} />);
    expect(screen.queryByTestId("sprout")).not.toBeInTheDocument();
  });

  it("arranca el tallo con stroke-dashoffset en 1", () => {
    const { container } = render(<PlantGrowth stage={0} />);
    const stem = container.querySelector("path[stroke-dasharray]");
    expect(stem).toHaveAttribute("stroke-dashoffset", "1");
  });
});
