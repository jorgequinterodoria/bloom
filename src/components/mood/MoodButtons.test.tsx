import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoodButtons } from "./MoodButtons";

describe("MoodButtons", () => {
  it("entre semana muestra los 4 ánimos", () => {
    render(<MoodButtons weekend={false} onSelect={() => {}} onRide={() => {}} />);
    for (const label of ["Estresada", "Ansiosa", "Energética", "Sin motivación"]) {
      expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: /paseo/i })).not.toBeInTheDocument();
  });

  it("el fin de semana oculta ánimos y ofrece paseo", () => {
    render(<MoodButtons weekend onSelect={() => {}} onRide={() => {}} />);
    expect(screen.queryByRole("button", { name: /Estresada/i })).not.toBeInTheDocument();
    const ride = screen.getByRole("button", { name: /paseo/i });
    expect(ride).toBeInTheDocument();
    fireEvent.click(ride);
  });

  it("notifica el ánimo elegido", () => {
    const onSelect = vi.fn();
    render(<MoodButtons weekend={false} onSelect={onSelect} onRide={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Ansiosa/i }));
    expect(onSelect).toHaveBeenCalledWith("Ansiosa");
  });
});
