import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SOSModal } from "./SOSModal";

describe("SOSModal", () => {
  it("no se renderiza cuando está cerrado", () => {
    render(<SOSModal open={false} onClose={() => { }} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("muestra la experiencia de calma al abrir, y cierra", () => {
    const onClose = vi.fn();
    render(<SOSModal open onClose={onClose} />);
    expect(screen.getByText(/modo calma/i)).toBeInTheDocument();
    expect(screen.getByText(/hablar con alguien/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cerrar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/cerrar/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("expone el diálogo con su nombre accesible", () => {
    render(<SOSModal open onClose={() => { }} />);
    expect(
      screen.getByRole("dialog", { name: /modo calma/i }),
    ).toBeInTheDocument();
  });

  it("cierra al pulsar Escape", () => {
    const onClose = vi.fn();
    render(<SOSModal open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
