import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, LanguageSwitcher, localeForDay, useI18n } from "./i18n";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

function Message() {
    const { t } = useI18n();
    return <p>{t("homeTitle")}</p>;
}

function renderLanguagePicker() {
    return render(
        <I18nProvider>
            <LanguageSwitcher />
            <Message />
        </I18nProvider>,
    );
}

describe("i18n", () => {
    beforeEach(() => localStorage.clear());

    it("rotates through the five locales on weekdays", () => {
        const monday = new Date(2026, 8, 28, 12);
        const locales = Array.from({ length: 5 }, (_, day) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + day);
            return localeForDay(date);
        });

        expect(locales).toEqual(["es", "fr", "pt", "en", "it"]);
    });

    it("lets the user override the daily locale and remembers the choice", async () => {
        renderLanguagePicker();

        fireEvent.change(screen.getByRole("combobox", { name: "Idioma" }), {
            target: { value: "fr" },
        });

        expect(screen.getByText("Comment vous sentez-vous aujourd’hui ?")).toBeInTheDocument();
        expect(localStorage.getItem("bloom-locale")).toBe("fr");
        await waitFor(() => expect(document.documentElement.lang).toBe("fr"));
    });

    it("restores a manually selected locale on the next visit", async () => {
        localStorage.setItem("bloom-locale", "it");
        renderLanguagePicker();

        expect(await screen.findByText("Come ti senti oggi?")).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Lingua" })).toHaveValue("it");
        await waitFor(() => expect(document.documentElement.lang).toBe("it"));
    });
});
