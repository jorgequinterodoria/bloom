import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayKey } from "@/lib/utils";
import HomeScreen from "./HomeScreen";

const { push, signOutMock, isWeekendDayMock } = vi.hoisted(() => ({
  push: vi.fn(),
  signOutMock: vi.fn(),
  isWeekendDayMock: vi.fn(() => false),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next-auth/react", () => ({ signOut: signOutMock }));
vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual, isWeekendDay: isWeekendDayMock };
});

interface FetchResult {
  ok?: boolean;
  json: () => Promise<unknown>;
}

const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<FetchResult>>();

interface LogPayload {
  checkedIn: boolean;
  moodId: string | null;
  workoutDone: boolean;
  weekendRide: boolean;
  sosTriggered: boolean;
  dayKey: string;
}

const defaultLog: LogPayload = {
  checkedIn: false,
  moodId: null,
  workoutDone: false,
  weekendRide: false,
  sosTriggered: false,
  dayKey: todayKey(),
};

let logPayload: LogPayload = { ...defaultLog };

function ok(data: unknown): Promise<FetchResult> {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
}

function callsTo(prefix: string) {
  return fetchMock.mock.calls.filter(([input]) => String(input).startsWith(prefix));
}

function postBody(call: (typeof fetchMock.mock.calls)[number]) {
  return JSON.parse(String(call[1]?.body));
}

describe("HomeScreen", () => {
  beforeEach(() => {
    push.mockReset();
    signOutMock.mockReset();
    isWeekendDayMock.mockReset();
    isWeekendDayMock.mockReturnValue(false);
    logPayload = { ...defaultLog, dayKey: todayKey() };
    fetchMock.mockReset();
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.startsWith("/api/plant")) return ok({ stage: 2 });
      if (url.startsWith("/api/log")) return ok(logPayload);
      if (url.startsWith("/api/checkin")) return ok({ ok: true, stage: 3, dayKey: todayKey() });
      if (url.startsWith("/api/ride")) return ok({ ok: true, stage: 4, dayKey: todayKey() });
      if (url.startsWith("/api/sos")) return ok({ ok: true, dayKey: todayKey() });
      return ok({});
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("al montar carga la planta y el registro del día y muestra la planta y los 4 ánimos", async () => {
    render(<HomeScreen />);

    expect(await screen.findByRole("img", { name: /planta/i })).toBeInTheDocument();

    const plantCalls = callsTo("/api/plant");
    expect(plantCalls).toHaveLength(1);

    const logCalls = callsTo("/api/log");
    expect(logCalls).toHaveLength(1);
    expect(logCalls[0][0]).toBe(`/api/log?day=${todayKey()}`);

    const region = await screen.findByRole("region", { name: /registro de ánimo/i });
    expect(within(region).getAllByRole("button")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /paseo/i })).not.toBeInTheDocument();
  });

  it("al tocar un ánimo hace POST /api/checkin con mood y day y navega a /move", async () => {
    render(<HomeScreen />);

    fireEvent.click(await screen.findByRole("button", { name: /ansiosa/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/move?mood=Ansiosa"));

    const calls = callsTo("/api/checkin");
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("/api/checkin");
    expect(calls[0][1]?.method).toBe("POST");
    expect(postBody(calls[0])).toEqual({ mood: "Ansiosa", day: todayKey() });
  });

  it("con doble toque rápido solo envía un checkin", async () => {
    render(<HomeScreen />);

    const pill = await screen.findByRole("button", { name: /ansiosa/i });
    fireEvent.click(pill);
    fireEvent.click(pill);

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(callsTo("/api/checkin")).toHaveLength(1);
  });

  it("el botón SOS abre el diálogo y dispara POST /api/sos con el día", async () => {
    render(<HomeScreen />);

    fireEvent.click(await screen.findByRole("button", { name: /ayuda urgente \(sos\)/i }));

    expect(await screen.findByRole("dialog", { name: /modo calma/i })).toBeInTheDocument();

    await waitFor(() => {
      const calls = callsTo("/api/sos");
      expect(calls).toHaveLength(1);
      expect(calls[0][1]?.method).toBe("POST");
      expect(postBody(calls[0])).toEqual({ day: todayKey() });
    });
  });

  it("si ya registraste hoy muestra la confirmación sin ánimos", async () => {
    logPayload = { ...logPayload, checkedIn: true, moodId: "Ansiosa" };

    render(<HomeScreen />);

    expect(await screen.findByText(/gracias por registrar cómo te sientes/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ansiosa/i })).not.toBeInTheDocument();
  });

  it("fin de semana: ofrece el paseo y lo registra con POST /api/ride", async () => {
    isWeekendDayMock.mockReturnValue(true);

    render(<HomeScreen />);

    fireEvent.click(
      await screen.findByRole("button", { name: /registrar paseo del fin de semana/i }),
    );

    await waitFor(() => expect(screen.getByText(/paseo registrado/i)).toBeInTheDocument());

    const calls = callsTo("/api/ride");
    expect(calls).toHaveLength(1);
    expect(calls[0][1]?.method).toBe("POST");
    expect(postBody(calls[0])).toEqual({ day: todayKey() });
  });
});
