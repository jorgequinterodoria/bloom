import type { Metadata } from "next";
import HomeScreen from "@/components/HomeScreen";

export const metadata: Metadata = {
  title: "¿Cómo te sientes hoy?",
  description:
    "Registra tu ánimo, mira crecer tu planta y empieza un movimiento suave.",
};

export default function Home() {
  return <HomeScreen />;
}
