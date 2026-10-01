import type { Metadata, Viewport } from "next";
import { SWRegister } from "@/components/SWRegister";
import { OfflineSync } from "@/components/OfflineSync";
import { I18nProvider, LanguageSwitcher } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bloom — movimiento sin prisa", template: "%s · Bloom" },
  description: "Un espacio de bienestar que se adapta a tu ritmo y crece contigo.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f7f4ee", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-surface text-ink antialiased">
        <I18nProvider>
          <SWRegister />
          <OfflineSync />
          <div className="mx-auto min-h-dvh w-full max-w-[430px] px-5 pb-6">
            <LanguageSwitcher />
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
