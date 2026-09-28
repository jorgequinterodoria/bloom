import { BatteryLow, Bike, Cloud, Wind, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MoodDef {
  name: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

export interface FlowExercise {
  name: string;
  durationSeconds: number;
}

export const MOODS: MoodDef[] = [
  {
    name: "Estresada",
    label: "Estresada",
    hint: "Soltar tensión",
    icon: Wind,
  },
  {
    name: "Ansiosa",
    label: "Ansiosa",
    hint: "Bajar revoluciones",
    icon: Cloud,
  },
  {
    name: "Energética",
    label: "Energética",
    hint: "Usar la energía",
    icon: Zap,
  },
  {
    name: "Sin motivación",
    label: "Sin motivación",
    hint: "Empezar despacio",
    icon: BatteryLow,
  },
];

export const WEEKEND_ICON = Bike;

export const EXERCISE_LIBRARY: Record<string, FlowExercise[]> = {
  Estresada: [
    { name: "Respiración 4-7-8", durationSeconds: 60 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
  ],
  Ansiosa: [
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Abrazo con respiración", durationSeconds: 45 },
  ],
  "Energética": [
    { name: "Marcha en el sitio", durationSeconds: 60 },
    { name: "Rotación de brazos", durationSeconds: 45 },
    { name: "Sentadillas suaves", durationSeconds: 60 },
    { name: "Rebotes ligeros", durationSeconds: 45 },
  ],
  "Sin motivación": [
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Caminata lenta en el sitio", durationSeconds: 60 },
  ],
};

export function findFlow(moodName: string): FlowExercise[] {
  return EXERCISE_LIBRARY[moodName] ?? [];
}
