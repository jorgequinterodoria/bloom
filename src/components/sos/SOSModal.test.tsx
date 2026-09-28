import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SOSModal } from "./SOSModal";

describe("SOSModal", () => {
  it("no se renderiza cuando está cerrado", () => {
    render(<SOSModal open={false} onClose={() => {}} />);
    expect(screen.queryByText(/sugerencia de consuelo/i)).not.toBeInTheDocument();
  });

  it("muestra respiración y sugerencia al abrir, y cierra", () => {
    const onClose = vi.fn();
    render(<SOSModal open onClose={onClose} />);
    expect(screen.getByText(/sugerencia de consuelo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cerrar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/cerrar/i));
    expect(onClose).toHaveBeenCalled();
  });
});
