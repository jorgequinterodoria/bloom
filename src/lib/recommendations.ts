export type RecommendationInput = {
  mood?: string | null;
  energy: number;
  stress: number;
  preferredDuration?: number;
  recentStress?: number[];
  recentEnergy?: number[];
};

export type Recommendation = {
  mood: string;
  titleKey: "recommendRelease" | "recommendMinimum" | "recommendEnergy" | "recommendBalance";
  descriptionKey: "recommendReleaseDesc" | "recommendMinimumDesc" | "recommendEnergyDesc" | "recommendBalanceDesc";
  reasonKey: "reasonStressTrend" | "reasonStress" | "reasonEnergyTrend" | "reasonEnergy" | "reasonGoodEnergy" | "reasonBalance";
  duration: number;
  intensity: "gentle" | "moderate" | "activating";
  priority: "stress" | "energy" | "consistency" | "balance";
};

const clamp = (value: number, min = 1, max = 5) => Math.min(max, Math.max(min, value));

export function buildRecommendation(input: RecommendationInput): Recommendation {
  const energy = clamp(input.energy || 3);
  const stress = clamp(input.stress || 3);
  const recentStress = input.recentStress?.filter(Number.isFinite) ?? [];
  const recentEnergy = input.recentEnergy?.filter(Number.isFinite) ?? [];
  const stressTrend = recentStress.length >= 2 ? recentStress.at(0)! - recentStress.at(-1)! : 0;
  const energyTrend = recentEnergy.length >= 2 ? recentEnergy.at(0)! - recentEnergy.at(-1)! : 0;
  const duration = Math.min(30, Math.max(5, Math.round((input.preferredDuration ?? 15) / 5) * 5));

  if (stress >= 4 || stressTrend >= 1) return { mood: input.mood ?? "Estresada", titleKey: "recommendRelease", descriptionKey: "recommendReleaseDesc", reasonKey: stressTrend >= 1 ? "reasonStressTrend" : "reasonStress", duration, intensity: "gentle", priority: "stress" };
  if (energy <= 2 || energyTrend <= -1) return { mood: input.mood ?? "Sin motivación", titleKey: "recommendMinimum", descriptionKey: "recommendMinimumDesc", reasonKey: energyTrend <= -1 ? "reasonEnergyTrend" : "reasonEnergy", duration: Math.min(duration, 15), intensity: "gentle", priority: "energy" };
  if (energy >= 4 && stress <= 2) return { mood: input.mood ?? "Energética", titleKey: "recommendEnergy", descriptionKey: "recommendEnergyDesc", reasonKey: "reasonGoodEnergy", duration, intensity: "activating", priority: "energy" };
  return { mood: input.mood ?? "Ansiosa", titleKey: "recommendBalance", descriptionKey: "recommendBalanceDesc", reasonKey: "reasonBalance", duration, intensity: "moderate", priority: "balance" };
}
