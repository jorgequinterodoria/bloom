export type CoachMood = "ground" | "energy" | "movement" | "reflection";
import type { CoachReplyId } from "@/lib/coach-i18n";

export interface CoachReply {
  id: CoachReplyId;
  mood: CoachMood;
  title: string;
  body: string;
  action: string;
  reason: string;
  values: Record<string, string | number>;
}

export interface CoachLog {
  dayKey: string;
  mood: string | null;
  energy: number;
  stress: number;
  note?: string | null;
  workoutDone?: boolean;
}

export interface CoachSession {
  beforeStress: number;
  afterStress: number | null;
  beforeEnergy: number;
  afterEnergy: number | null;
  durationSeconds: number;
  dayKey: string;
}

export interface CoachContext {
  latest: CoachLog | null;
  recent: CoachLog[];
  sessions: CoachSession[];
  preferredDuration: number;
  focus: string;
}

const average = (values: number[]) => {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
};

function trend(values: number[]) {
  if (values.length < 2) return 0;
  return Math.round((values[0] - values.at(-1)!) * 10) / 10;
}

export function buildCoachBrief(context: CoachContext): CoachReply {
  const latest = context.latest;
  const recent = context.recent;
  const sessions = context.sessions.filter((session) => session.afterStress !== null || session.afterEnergy !== null);
  const stressAverage = average(recent.map((item) => item.stress));
  const energyAverage = average(recent.map((item) => item.energy));
  const stressTrend = trend(recent.map((item) => item.stress));
  const energyTrend = trend(recent.map((item) => item.energy));
  const stressImpacts = sessions.map((session) => session.afterStress === null ? 0 : session.afterStress - session.beforeStress).filter((value) => value !== 0);
  const energyImpacts = sessions.map((session) => session.afterEnergy === null ? 0 : session.afterEnergy - session.beforeEnergy).filter((value) => value !== 0);

  if (!latest) {
    return {
      mood: "reflection" as CoachMood,
      id: "brief.empty",
      title: "Empecemos por cómo llegas hoy.",
      body: "Haz un check-in breve. Con un poco de contexto, Bloom puede darte una recomendación más útil y personal.",
      action: "Registrar mi estado",
      reason: "Todavía no hay suficiente historia para detectar un patrón.",
      values: {},
    };
  }

  if (latest.stress >= 4 || stressTrend >= 1) {
    return {
      mood: "ground" as CoachMood,
      id: stressTrend >= 1 ? "brief.stressTrend" : "brief.stress",
      title: "Hoy conviene bajar una marcha.",
      body: "No necesitas resolver todo ahora. Empieza por una sesión suave, una respiración lenta y una meta pequeña.",
      action: `Hacer ${Math.min(context.preferredDuration, 15)} minutos suaves`,
      reason: stressTrend >= 1 ? "Bloom detecta que el estrés viene subiendo en tus registros recientes." : "Tu nivel de estrés está alto hoy.",
      values: { minutes: Math.min(context.preferredDuration, 15) },
    };
  }

  if (latest.energy <= 2 || energyTrend <= -1) {
    return {
      mood: "energy" as CoachMood,
      id: energyTrend <= -1 ? "brief.energyTrend" : "brief.energy",
      title: "Hoy basta con empezar pequeño.",
      body: "Cuando la energía está baja, la constancia importa más que la intensidad. Una sesión corta ya cuenta.",
      action: `Empezar con ${Math.min(context.preferredDuration, 10)} minutos`,
      reason: energyTrend <= -1 ? "Tu energía ha bajado respecto a tus registros recientes." : "Tu energía está baja hoy.",
      values: { minutes: Math.min(context.preferredDuration, 10) },
    };
  }

  if (latest.energy >= 4 && latest.stress <= 2) {
    return {
      mood: "movement" as CoachMood,
      id: "brief.movement",
      title: "Tienes un buen margen para moverte.",
      body: "Aprovecha la energía sin convertirla en presión. Una secuencia algo más activa, pero controlada, puede encajar bien hoy.",
      action: `Moverme ${context.preferredDuration} minutos`,
      reason: "Tu energía está alta y el estrés se mantiene bajo.",
      values: { minutes: context.preferredDuration },
    };
  }

  const positiveStressSessions = stressImpacts.filter((value) => value < 0).length;
  const positiveEnergySessions = energyImpacts.filter((value) => value > 0).length;
  const hasProgress = positiveStressSessions > 0 || positiveEnergySessions > 0;
  return {
    mood: "reflection" as CoachMood,
    id: hasProgress ? "brief.reflectionProgress" : "brief.reflection",
    title: "Tu señal principal hoy es equilibrio.",
    body: positiveStressSessions > 0 || positiveEnergySessions > 0
      ? "Tus sesiones recientes ya muestran pequeños cambios. Mantén un ritmo que puedas repetir, no uno que tengas que sostener a la fuerza."
      : "No hace falta optimizar el día. Elige un movimiento que se sienta sostenible y observa cómo respondes.",
    action: `Seguir con tu ritmo de ${context.preferredDuration} minutos`,
    reason: `En los últimos registros, tu energía media es ${energyAverage}/5 y tu estrés medio es ${stressAverage}/5.`,
    values: { minutes: context.preferredDuration, energy: energyAverage, stress: stressAverage },
  };
}

export function answerCoach(message: string, context: CoachContext): CoachReply {
  const normalized = message.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const latest = context.latest;
  const recent = context.recent;
  const stress = latest?.stress ?? average(recent.map((item) => item.stress));
  const energy = latest?.energy ?? average(recent.map((item) => item.energy));

  if (/estres|stress|estresse|ansie|anx|tens|calm|agobi|presi|overwhelm|pressure|tensao|sobrecarga/.test(normalized)) {
    return {
      mood: "ground" as CoachMood,
      id: "answer.stress",
      title: "Vamos a quitarle intensidad al momento.",
      body: "Prueba una pausa de dos minutos: hombros sueltos, mandíbula relajada y exhalaciones un poco más largas que las inhalaciones. Después decide si quieres seguir con la sesión o simplemente parar.",
      action: "Abrir una pausa guiada",
      reason: stress >= 4 ? "Tu registro de hoy también apunta a una carga alta." : "Has preguntado por calma; podemos empezar sin exigir rendimiento.",
      values: { reason: stress >= 4 ? "Tu registro de hoy también apunta a una carga alta." : "Has preguntado por calma; podemos empezar sin exigir rendimiento." },
    };
  }

  if (/energ|cansad|agot|motiv|pereza|tired|fatig|energia|energy|stanc|stanch|motivated/.test(normalized)) {
    return {
      mood: "energy" as CoachMood,
      id: "answer.energy",
      title: "No necesitas sentirte al 100% para empezar.",
      body: "Haz el primer movimiento durante un minuto. Después comprueba si tu energía cambia. Si no cambia, también es válido reducir la sesión.",
      action: "Empezar con un minuto",
      reason: energy <= 2 ? "Tu energía registrada está baja hoy." : "A veces la motivación aparece después de empezar, no antes.",
      values: { reason: energy <= 2 ? "Tu energía registrada está baja hoy." : "A veces la motivación aparece después de empezar, no antes." },
    };
  }

  if (/rutina|ejercicio|exercise|mover|movim|sesion|session|entren|movement|movimento|esercizio|allen/.test(normalized)) {
    return {
      mood: "movement" as CoachMood,
      id: "answer.movement",
      title: `Tu punto de partida puede ser ${Math.min(context.preferredDuration, energy <= 2 ? 10 : context.preferredDuration)} minutos.`,
      body: "Elige una sesión que puedas terminar con sensación de margen. Bloom puede ajustar la intensidad según cómo llegues.",
      action: "Ver mi sesión recomendada",
      reason: latest ? `Hoy registraste ${energy}/5 de energía y ${stress}/5 de estrés.` : "Todavía no tenemos un check-in de hoy.",
      values: { minutes: Math.min(context.preferredDuration, energy <= 2 ? 10 : context.preferredDuration), reason: latest ? `Hoy registraste ${energy}/5 de energía y ${stress}/5 de estrés.` : "Todavía no tenemos un check-in de hoy." },
    };
  }

  if (/progres|mejor|patron|historia|avance|progress|pattern|history|progresso|storia/.test(normalized)) {
    const completed = context.sessions.length;
    return {
      mood: "reflection" as CoachMood,
      id: completed ? "answer.progress" : "answer.progressStart",
      title: completed ? `Ya has completado ${completed} sesiones con Bloom.` : "Tu historia apenas comienza.",
      body: completed ? "Mira cómo cambian tus respuestas antes y después de las sesiones. El dato más útil no es la perfección, sino lo que puedes repetir." : "Registra un par de días y Bloom empezará a mostrarte patrones de energía, estrés y movimiento.",
      action: "Ver mi evolución",
      reason: "Los cambios tienen más sentido cuando se comparan contigo mismo a lo largo del tiempo.",
      values: { sessions: completed },
    };
  }

  return {
    mood: "reflection" as CoachMood,
    id: "answer.default",
    title: "Te escucho.",
    body: "Cuéntame qué necesitas hoy: bajar el estrés, recuperar energía, decidir qué movimiento hacer o entender cómo vas cambiando.",
    action: "Elegir una dirección",
    reason: latest ? `Ahora mismo: energía ${energy}/5 · estrés ${stress}/5.` : "Aún no tengo un check-in reciente para personalizar la respuesta.",
    values: { reason: latest ? `Ahora mismo: energía ${energy}/5 · estrés ${stress}/5.` : "Aún no tengo un check-in reciente para personalizar la respuesta." },
  };
}
