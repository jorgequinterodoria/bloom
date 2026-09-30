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

export const MOODS = [
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
] as const satisfies readonly MoodDef[];

export type MoodName = (typeof MOODS)[number]["name"];

export const WEEKEND_ICON = Bike;

export const EXERCISE_LIBRARY: Record<MoodName, FlowExercise[]> = {
  Estresada: [
    { name: "Respiración 4-7-8", durationSeconds: 60 },
    { name: "Respiración lateral", durationSeconds: 60 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Círculos de hombros", durationSeconds: 45 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Estiramiento de pecho", durationSeconds: 60 },
    { name: "Inclinaciones laterales", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Estiramiento de isquiotibiales sentado", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Relajación facial", durationSeconds: 60 },
    { name: "Abrazo con respiración", durationSeconds: 45 },
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Respiración profunda", durationSeconds: 60 },
  ],
  Ansiosa: [
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Respiración en caja", durationSeconds: 60 },
    { name: "Respiración 4-7-8", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 60 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Abrazo con respiración", durationSeconds: 60 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Estiramiento de isquiotibiales sentado", durationSeconds: 60 },
    { name: "Relajación facial", durationSeconds: 60 },
    { name: "Respiración lateral", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Estiramiento de pecho", durationSeconds: 60 },
    { name: "Círculos de hombros", durationSeconds: 45 },
    { name: "Postura de la montaña", durationSeconds: 45 },
  ],
  "Energética": [
    { name: "Marcha en el sitio", durationSeconds: 60 },
    { name: "Rotación de brazos", durationSeconds: 60 },
    { name: "Jumping jack suave", durationSeconds: 90 },
    { name: "Sentadillas suaves", durationSeconds: 90 },
    { name: "Zancadas alternas", durationSeconds: 90 },
    { name: "Puente de glúteos", durationSeconds: 75 },
    { name: "Escaladores lentos", durationSeconds: 75 },
    { name: "Flexiones en pared", durationSeconds: 90 },
    { name: "Supermán", durationSeconds: 75 },
    { name: "Rebotes ligeros", durationSeconds: 60 },
    { name: "Caminata lenta en el sitio", durationSeconds: 60 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Inclinaciones laterales", durationSeconds: 60 },
    { name: "Estiramiento de pecho", durationSeconds: 60 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Respiración profunda", durationSeconds: 60 },
  ],
  "Sin motivación": [
    { name: "Estiramiento al despertar", durationSeconds: 45 },
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Círculos de hombros", durationSeconds: 45 },
    { name: "Caminata lenta en el sitio", durationSeconds: 60 },
    { name: "Marcha en el sitio", durationSeconds: 60 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Inclinaciones laterales", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Sentadillas suaves", durationSeconds: 60 },
    { name: "Rotación de brazos", durationSeconds: 45 },
    { name: "Mariposa sentado", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Respiración 4-7-8", durationSeconds: 60 },
  ],
};

export function findFlow(moodName: string): FlowExercise[] {
  return EXERCISE_LIBRARY[moodName as MoodName] ?? [];
}
