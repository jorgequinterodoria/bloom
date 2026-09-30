import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoodButtons } from "./MoodButtons";

describe("MoodButtons", () => {
  it("entre semana muestra los 4 ánimos", () => {
    render(<MoodButtons weekend={false} onSelect={() => { }} onRide={() => { }} />);
    for (const label of ["Estresada", "Ansiosa", "Energética", "Sin motivación"]) {
      expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: /paseo/i })).not.toBeInTheDocument();
  });

  it("el fin de semana oculta ánimos y ofrece paseo", () => {
    const onRide = vi.fn();
    render(<MoodButtons weekend onSelect={() => { }} onRide={onRide} />);
    expect(screen.queryByRole("button", { name: /Estresada/i })).not.toBeInTheDocument();
    const ride = screen.getAllByRole("button", { name: /paseo/i })[0];
    expect(ride).toBeInTheDocument();
    fireEvent.click(ride);
    expect(onRide).toHaveBeenCalledTimes(1);
  });

  it("notifica el ánimo elegido", () => {
    const onSelect = vi.fn();
    render(<MoodButtons weekend={false} onSelect={onSelect} onRide={() => { }} />);
    fireEvent.click(screen.getByRole("button", { name: /Ansiosa/i }));
    expect(onSelect).toHaveBeenCalledWith("Ansiosa");
  });

  it("con disabled bloquea los ánimos y el paseo", () => {
    const onSelect = vi.fn();
    const { unmount } = render(
      <MoodButtons weekend={false} onSelect={onSelect} onRide={() => { }} disabled />
    );
    const pills = screen.getAllByRole("button");
    expect(pills).toHaveLength(4);
    for (const pill of pills) {
      expect(pill).toBeDisabled();
    }
    fireEvent.click(screen.getByRole("button", { name: /Ansiosa/i }));
    expect(onSelect).not.toHaveBeenCalled();
    unmount();

    const onRide = vi.fn();
    render(<MoodButtons weekend onSelect={() => { }} onRide={onRide} disabled />);
    const ride = screen.getAllByRole("button", { name: /paseo/i })[0];
    expect(ride).toBeDisabled();
    fireEvent.click(ride);
    expect(onRide).not.toHaveBeenCalled();
  });
});
