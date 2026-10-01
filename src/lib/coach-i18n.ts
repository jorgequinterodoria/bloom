import type { Locale } from "@/lib/i18n";

export const coachMessages: Record<Locale, Record<string, string>> = {
    es: {
        navCoach: "Coach", coachEyebrow: "Un espacio para ti", coachTitle: "Habla con Bloom", coachSubtitle: "Una guía personal basada en cómo estás llegando y en lo que has ido registrando.", coachDescription: "Una guía personal para tu bienestar con Bloom.", coachToday: "Para hoy", coachWhy: "Por qué", coachAsk: "¿Qué necesitas ahora?", coachPlaceholder: "Cuéntame qué está pasando…", coachSend: "Enviar", coachPromptStress: "Necesito bajar el estrés", coachPromptEnergy: "Hoy no tengo energía", coachPromptMovement: "¿Qué movimiento hago hoy?", coachPromptProgress: "¿Cómo voy progresando?", coachLoading: "Preparando tu Coach…", coachError: "No pudimos responder ahora. Intenta de nuevo.", soundscapesTitle: "Paisajes sonoros", soundscapesSubtitle: "Sonido ambiental generado en tu dispositivo.", soundRain: "Lluvia", soundOcean: "Mar", soundForest: "Bosque", soundNight: "Noche", soundVolume: "Volumen",
    },
    fr: {
        navCoach: "Coach", coachEyebrow: "Un espace pour vous", coachTitle: "Parlez avec Bloom", coachSubtitle: "Un accompagnement personnalisé selon votre état et ce que vous avez partagé.", coachDescription: "Un accompagnement bien-être personnalisé avec Bloom.", coachToday: "Pour aujourd’hui", coachWhy: "Pourquoi", coachAsk: "De quoi avez-vous besoin ?", coachPlaceholder: "Dites-moi ce qui se passe…", coachSend: "Envoyer", coachPromptStress: "J’ai besoin de réduire mon stress", coachPromptEnergy: "Je manque d’énergie aujourd’hui", coachPromptMovement: "Quel mouvement faire aujourd’hui ?", coachPromptProgress: "Comment est-ce que je progresse ?", coachLoading: "Préparation de votre coach…", coachError: "Impossible de répondre pour le moment. Réessayez.", soundscapesTitle: "Ambiances sonores", soundscapesSubtitle: "Sons d’ambiance générés sur votre appareil.", soundRain: "Pluie", soundOcean: "Océan", soundForest: "Forêt", soundNight: "Nuit", soundVolume: "Volume",
    },
    pt: {
        navCoach: "Coach", coachEyebrow: "Um espaço para você", coachTitle: "Converse com Bloom", coachSubtitle: "Uma orientação pessoal com base em como você está e no que vem registrando.", coachDescription: "Orientação personalizada de bem-estar com Bloom.", coachToday: "Para hoje", coachWhy: "Por quê", coachAsk: "Do que você precisa agora?", coachPlaceholder: "Conte o que está acontecendo…", coachSend: "Enviar", coachPromptStress: "Preciso aliviar o estresse", coachPromptEnergy: "Estou sem energia hoje", coachPromptMovement: "Que movimento faço hoje?", coachPromptProgress: "Como estou progredindo?", coachLoading: "Preparando seu Coach…", coachError: "Não foi possível responder agora. Tente novamente.", soundscapesTitle: "Paisagens sonoras", soundscapesSubtitle: "Som ambiente gerado no seu dispositivo.", soundRain: "Chuva", soundOcean: "Mar", soundForest: "Floresta", soundNight: "Noite", soundVolume: "Volume",
    },
    en: {
        navCoach: "Coach", coachEyebrow: "A space for you", coachTitle: "Talk with Bloom", coachSubtitle: "Personal guidance based on how you’re feeling and what you’ve shared.", coachDescription: "Personal wellbeing guidance from Bloom.", coachToday: "For today", coachWhy: "Why this", coachAsk: "What do you need right now?", coachPlaceholder: "Tell me what’s going on…", coachSend: "Send", coachPromptStress: "I need to lower my stress", coachPromptEnergy: "I have no energy today", coachPromptMovement: "What movement should I do today?", coachPromptProgress: "How am I progressing?", coachLoading: "Getting your Coach ready…", coachError: "We couldn’t reply just now. Please try again.", soundscapesTitle: "Soundscapes", soundscapesSubtitle: "Ambient sound generated on your device.", soundRain: "Rain", soundOcean: "Ocean", soundForest: "Forest", soundNight: "Night", soundVolume: "Volume",
    },
    it: {
        navCoach: "Coach", coachEyebrow: "Uno spazio per te", coachTitle: "Parla con Bloom", coachSubtitle: "Una guida personale basata su come ti senti e su ciò che hai condiviso.", coachDescription: "Una guida personale al benessere con Bloom.", coachToday: "Per oggi", coachWhy: "Perché", coachAsk: "Di cosa hai bisogno adesso?", coachPlaceholder: "Raccontami cosa succede…", coachSend: "Invia", coachPromptStress: "Ho bisogno di ridurre lo stress", coachPromptEnergy: "Oggi non ho energia", coachPromptMovement: "Che movimento posso fare oggi?", coachPromptProgress: "Come sto progredendo?", coachLoading: "Preparazione del Coach…", coachError: "Non riusciamo a rispondere ora. Riprova.", soundscapesTitle: "Paesaggi sonori", soundscapesSubtitle: "Suoni ambientali generati sul tuo dispositivo.", soundRain: "Pioggia", soundOcean: "Mare", soundForest: "Foresta", soundNight: "Notte", soundVolume: "Volume",
    },
};

export type CoachReplyId =
    | "brief.empty" | "brief.stressTrend" | "brief.stress" | "brief.energyTrend" | "brief.energy"
    | "brief.movement" | "brief.reflectionProgress" | "brief.reflection"
    | "answer.stress" | "answer.energy" | "answer.movement" | "answer.progress" | "answer.progressStart" | "answer.default";

export interface CoachReplyCopy {
    title: string;
    body: string;
    action: string;
    reason: string;
}

type CopyFields = readonly [string, string, string, string];
type LocalizedReply = Record<Locale, CopyFields>;

const replyCopy: Record<CoachReplyId, LocalizedReply> = {
    "brief.empty": {
        es: ["Empecemos por cómo llegas hoy.", "Haz un check-in breve. Con un poco de contexto, Bloom puede darte una recomendación más útil y personal.", "Registrar mi estado", "Todavía no hay suficiente historia para detectar un patrón."],
        fr: ["Commençons par votre état du jour.", "Faites un bref point sur votre humeur. Avec un peu de contexte, Bloom pourra vous proposer un conseil plus personnel.", "Noter mon état", "Il n’y a pas encore assez d’historique pour repérer une tendance."],
        pt: ["Vamos começar por como você está hoje.", "Faça um check-in breve. Com um pouco de contexto, Bloom pode oferecer uma recomendação mais útil e pessoal.", "Registrar como estou", "Ainda não há histórico suficiente para identificar um padrão."],
        en: ["Let’s start with how you’re feeling today.", "Check in briefly. A little context helps Bloom offer a more useful, personal suggestion.", "Check in", "There isn’t enough history yet to spot a pattern."],
        it: ["Partiamo da come ti senti oggi.", "Fai un breve check-in. Con un po’ di contesto, Bloom può offrirti un consiglio più utile e personale.", "Registra come sto", "Non ci sono ancora abbastanza dati per individuare uno schema."],
    },
    "brief.stressTrend": {
        es: ["Hoy conviene bajar una marcha.", "No necesitas resolver todo ahora. Empieza por una sesión suave, una respiración lenta y una meta pequeña.", "Hacer {minutes} minutos suaves", "Bloom detecta que el estrés viene subiendo en tus registros recientes."],
        fr: ["Aujourd’hui, mieux vaut ralentir un peu.", "Vous n’avez pas à tout résoudre maintenant. Commencez par une séance douce, une respiration lente et un petit objectif.", "Faire {minutes} minutes en douceur", "Bloom remarque une hausse du stress dans vos entrées récentes."],
        pt: ["Hoje vale desacelerar um pouco.", "Você não precisa resolver tudo agora. Comece com uma sessão leve, uma respiração lenta e uma meta pequena.", "Fazer {minutes} minutos leves", "Bloom percebe que o estresse vem aumentando nos seus registros recentes."],
        en: ["Today is a good day to slow things down.", "You don’t have to solve everything now. Start with a gentle session, a slow breath, and one small goal.", "Try {minutes} gentle minutes", "Bloom noticed your stress rising in recent check-ins."],
        it: ["Oggi può essere utile rallentare.", "Non devi risolvere tutto adesso. Inizia con una sessione leggera, un respiro lento e un piccolo obiettivo.", "Fai {minutes} minuti leggeri", "Bloom nota che lo stress è in aumento nei tuoi ultimi check-in."],
    },
    "brief.stress": {
        es: ["Hoy conviene bajar una marcha.", "No necesitas resolver todo ahora. Empieza por una sesión suave, una respiración lenta y una meta pequeña.", "Hacer {minutes} minutos suaves", "Tu nivel de estrés está alto hoy."],
        fr: ["Aujourd’hui, mieux vaut ralentir un peu.", "Vous n’avez pas à tout résoudre maintenant. Commencez par une séance douce, une respiration lente et un petit objectif.", "Faire {minutes} minutes en douceur", "Votre niveau de stress est élevé aujourd’hui."],
        pt: ["Hoje vale desacelerar um pouco.", "Você não precisa resolver tudo agora. Comece com uma sessão leve, uma respiração lenta e uma meta pequena.", "Fazer {minutes} minutos leves", "Seu nível de estresse está alto hoje."],
        en: ["Today is a good day to slow things down.", "You don’t have to solve everything now. Start with a gentle session, a slow breath, and one small goal.", "Try {minutes} gentle minutes", "Your stress level is high today."],
        it: ["Oggi può essere utile rallentare.", "Non devi risolvere tutto adesso. Inizia con una sessione leggera, un respiro lento e un piccolo obiettivo.", "Fai {minutes} minuti leggeri", "Il tuo livello di stress è alto oggi."],
    },
    "brief.energyTrend": {
        es: ["Hoy basta con empezar pequeño.", "Cuando la energía está baja, la constancia importa más que la intensidad. Una sesión corta ya cuenta.", "Empezar con {minutes} minutos", "Tu energía ha bajado respecto a tus registros recientes."],
        fr: ["Aujourd’hui, un petit début suffit.", "Quand l’énergie baisse, la régularité compte plus que l’intensité. Une courte séance suffit déjà.", "Commencer par {minutes} minutes", "Votre énergie a baissé par rapport à vos entrées récentes."],
        pt: ["Hoje, começar pequeno já basta.", "Quando a energia está baixa, a constância importa mais que a intensidade. Uma sessão curta já conta.", "Começar com {minutes} minutos", "Sua energia diminuiu em relação aos registros recentes."],
        en: ["A small start is enough today.", "When energy is low, consistency matters more than intensity. A short session counts.", "Start with {minutes} minutes", "Your energy has dropped compared with recent check-ins."],
        it: ["Oggi basta iniziare con poco.", "Quando l’energia è bassa, la costanza conta più dell’intensità. Anche una sessione breve vale.", "Inizia con {minutes} minuti", "La tua energia è diminuita rispetto ai check-in recenti."],
    },
    "brief.energy": {
        es: ["Hoy basta con empezar pequeño.", "Cuando la energía está baja, la constancia importa más que la intensidad. Una sesión corta ya cuenta.", "Empezar con {minutes} minutos", "Tu energía está baja hoy."],
        fr: ["Aujourd’hui, un petit début suffit.", "Quand l’énergie baisse, la régularité compte plus que l’intensité. Une courte séance suffit déjà.", "Commencer par {minutes} minutes", "Votre énergie est basse aujourd’hui."],
        pt: ["Hoje, começar pequeno já basta.", "Quando a energia está baixa, a constância importa mais que a intensidade. Uma sessão curta já conta.", "Começar com {minutes} minutos", "Sua energia está baixa hoje."],
        en: ["A small start is enough today.", "When energy is low, consistency matters more than intensity. A short session counts.", "Start with {minutes} minutes", "Your energy is low today."],
        it: ["Oggi basta iniziare con poco.", "Quando l’energia è bassa, la costanza conta più dell’intensità. Anche una sessione breve vale.", "Inizia con {minutes} minuti", "La tua energia è bassa oggi."],
    },
    "brief.movement": {
        es: ["Tienes un buen margen para moverte.", "Aprovecha la energía sin convertirla en presión. Una secuencia algo más activa, pero controlada, puede encajar bien hoy.", "Moverme {minutes} minutos", "Tu energía está alta y el estrés se mantiene bajo."],
        fr: ["Vous avez de l’énergie pour bouger.", "Profitez de cette énergie sans vous mettre la pression. Une séquence un peu plus active et maîtrisée peut vous convenir.", "Bouger {minutes} minutes", "Votre énergie est élevée et votre stress reste bas."],
        pt: ["Você tem uma boa disposição para se movimentar.", "Use sua energia sem transformá-la em pressão. Uma sequência um pouco mais ativa e controlada pode combinar com hoje.", "Me movimentar por {minutes} minutos", "Sua energia está alta e o estresse continua baixo."],
        en: ["You have room to move today.", "Use your energy without turning it into pressure. A slightly more active, controlled sequence could fit well.", "Move for {minutes} minutes", "Your energy is high and stress is staying low."],
        it: ["Hai energia per muoverti.", "Usa questa energia senza trasformarla in pressione. Una sequenza un po’ più attiva ma controllata può fare al caso tuo.", "Muoviti per {minutes} minuti", "La tua energia è alta e lo stress rimane basso."],
    },
    "brief.reflectionProgress": {
        es: ["Tu señal principal hoy es equilibrio.", "Tus sesiones recientes ya muestran pequeños cambios. Mantén un ritmo que puedas repetir, no uno que tengas que sostener a la fuerza.", "Seguir con tu ritmo de {minutes} minutos", "En los últimos registros, tu energía media es {energy}/5 y tu estrés medio es {stress}/5."],
        fr: ["Votre priorité aujourd’hui est l’équilibre.", "Vos séances récentes montrent déjà de petits changements. Gardez un rythme que vous pouvez répéter sans vous forcer.", "Garder votre rythme de {minutes} minutes", "Sur vos dernières entrées, l’énergie moyenne est de {energy}/5 et le stress moyen de {stress}/5."],
        pt: ["Seu principal sinal hoje é o equilíbrio.", "Suas sessões recentes já mostram pequenas mudanças. Mantenha um ritmo que você consiga repetir sem se forçar.", "Manter seu ritmo de {minutes} minutos", "Nos registros recentes, sua energia média é {energy}/5 e seu estresse médio é {stress}/5."],
        en: ["Balance is your main signal today.", "Your recent sessions already show small changes. Keep a pace you can repeat, not one you have to force.", "Keep your {minutes}-minute pace", "In recent check-ins, average energy is {energy}/5 and average stress is {stress}/5."],
        it: ["Oggi il tuo segnale principale è l’equilibrio.", "Le sessioni recenti mostrano già piccoli cambiamenti. Mantieni un ritmo che puoi ripetere senza sforzarti.", "Continua al tuo ritmo di {minutes} minuti", "Nei check-in recenti, l’energia media è {energy}/5 e lo stress medio è {stress}/5."],
    },
    "brief.reflection": {
        es: ["Tu señal principal hoy es equilibrio.", "No hace falta optimizar el día. Elige un movimiento que se sienta sostenible y observa cómo respondes.", "Seguir con tu ritmo de {minutes} minutos", "En los últimos registros, tu energía media es {energy}/5 y tu estrés medio es {stress}/5."],
        fr: ["Votre priorité aujourd’hui est l’équilibre.", "Inutile d’optimiser la journée. Choisissez un mouvement durable et observez comment vous vous sentez.", "Garder votre rythme de {minutes} minutes", "Sur vos dernières entrées, l’énergie moyenne est de {energy}/5 et le stress moyen de {stress}/5."],
        pt: ["Seu principal sinal hoje é o equilíbrio.", "Você não precisa otimizar o dia. Escolha um movimento sustentável e observe como se sente.", "Manter seu ritmo de {minutes} minutos", "Nos registros recentes, sua energia média é {energy}/5 e seu estresse médio é {stress}/5."],
        en: ["Balance is your main signal today.", "There’s no need to optimize the day. Choose movement that feels sustainable and notice how you respond.", "Keep your {minutes}-minute pace", "In recent check-ins, average energy is {energy}/5 and average stress is {stress}/5."],
        it: ["Oggi il tuo segnale principale è l’equilibrio.", "Non serve ottimizzare la giornata. Scegli un movimento sostenibile e osserva come ti senti.", "Continua al tuo ritmo di {minutes} minuti", "Nei check-in recenti, l’energia media è {energy}/5 e lo stress medio è {stress}/5."],
    },
    "answer.stress": {
        es: ["Vamos a quitarle intensidad al momento.", "Prueba una pausa de dos minutos: hombros sueltos, mandíbula relajada y exhalaciones un poco más largas que las inhalaciones. Después decide si quieres seguir con la sesión o simplemente parar.", "Abrir una pausa guiada", "{reason}"],
        fr: ["Allégeons un peu ce moment.", "Faites une pause de deux minutes : relâchez les épaules et la mâchoire, puis expirez un peu plus longtemps que vous n’inspirez. Ensuite, choisissez de continuer ou de vous arrêter.", "Ouvrir une pause guidée", "{reason}"],
        pt: ["Vamos diminuir a intensidade deste momento.", "Faça uma pausa de dois minutos: solte os ombros e a mandíbula e expire um pouco mais devagar do que inspira. Depois, decida se quer continuar ou parar.", "Abrir uma pausa guiada", "{reason}"],
        en: ["Let’s make this moment feel a little lighter.", "Try a two-minute pause: soften your shoulders and jaw, and make each exhale a little longer than your inhale. Then decide whether to continue or stop.", "Open a guided pause", "{reason}"],
        it: ["Alleggeriamo un po’ questo momento.", "Fai una pausa di due minuti: rilassa spalle e mandibola ed espira un po’ più a lungo di quanto inspiri. Poi decidi se continuare o fermarti.", "Apri una pausa guidata", "{reason}"],
    },
    "answer.energy": {
        es: ["No necesitas sentirte al 100% para empezar.", "Haz el primer movimiento durante un minuto. Después comprueba si tu energía cambia. Si no cambia, también es válido reducir la sesión.", "Empezar con un minuto", "{reason}"],
        fr: ["Vous n’avez pas besoin d’être à 100 % pour commencer.", "Faites le premier mouvement pendant une minute, puis observez votre énergie. Si elle ne change pas, vous pouvez aussi raccourcir la séance.", "Commencer par une minute", "{reason}"],
        pt: ["Você não precisa estar com 100% de energia para começar.", "Faça o primeiro movimento por um minuto e observe sua energia. Se ela não mudar, também vale reduzir a sessão.", "Começar com um minuto", "{reason}"],
        en: ["You don’t have to feel 100% to begin.", "Try the first movement for one minute, then check whether your energy shifts. If it doesn’t, it’s okay to shorten the session.", "Start with one minute", "{reason}"],
        it: ["Non devi sentirti al 100% per iniziare.", "Prova il primo movimento per un minuto e poi nota se la tua energia cambia. Se non cambia, puoi anche accorciare la sessione.", "Inizia con un minuto", "{reason}"],
    },
    "answer.movement": {
        es: ["Tu punto de partida puede ser {minutes} minutos.", "Elige una sesión que puedas terminar con sensación de margen. Bloom puede ajustar la intensidad según cómo llegues.", "Ver mi sesión recomendada", "{reason}"],
        fr: ["Vous pouvez commencer par {minutes} minutes.", "Choisissez une séance que vous pouvez terminer sans vous épuiser. Bloom peut ajuster l’intensité selon votre état du jour.", "Voir ma séance recommandée", "{reason}"],
        pt: ["Você pode começar com {minutes} minutos.", "Escolha uma sessão que termine com a sensação de ainda ter energia. Bloom pode ajustar a intensidade conforme você está hoje.", "Ver minha sessão recomendada", "{reason}"],
        en: ["A good starting point could be {minutes} minutes.", "Choose a session you can finish with some energy to spare. Bloom can adjust the intensity to how you’re feeling.", "See my recommended session", "{reason}"],
        it: ["Puoi iniziare con {minutes} minuti.", "Scegli una sessione che ti lasci ancora un po’ di energia. Bloom può adattare l’intensità a come ti senti oggi.", "Vedi la sessione consigliata", "{reason}"],
    },
    "answer.progress": {
        es: ["Ya has completado {sessions} sesiones con Bloom.", "Mira cómo cambian tus respuestas antes y después de las sesiones. Lo más útil no es la perfección, sino lo que puedes repetir.", "Ver mi evolución", "Los cambios tienen más sentido cuando se comparan contigo mismo a lo largo del tiempo."],
        fr: ["Vous avez déjà terminé {sessions} séances avec Bloom.", "Observez l’évolution de vos réponses avant et après les séances. L’important n’est pas la perfection, mais ce que vous pouvez refaire.", "Voir mon évolution", "Les changements prennent tout leur sens quand on les compare à votre propre évolution."],
        pt: ["Você já concluiu {sessions} sessões com Bloom.", "Observe como suas respostas mudam antes e depois das sessões. O mais importante não é a perfeição, mas o que você consegue repetir.", "Ver minha evolução", "As mudanças fazem mais sentido quando comparadas com você ao longo do tempo."],
        en: ["You’ve completed {sessions} sessions with Bloom.", "Notice how your responses change before and after sessions. What matters isn’t perfection, but what you can repeat.", "See my progress", "Changes make more sense when compared with your own patterns over time."],
        it: ["Hai completato {sessions} sessioni con Bloom.", "Osserva come cambiano le tue risposte prima e dopo le sessioni. Conta meno la perfezione e più ciò che puoi ripetere.", "Vedi la mia evoluzione", "I cambiamenti hanno più senso se confrontati con il tuo percorso nel tempo."],
    },
    "answer.progressStart": {
        es: ["Tu historia apenas comienza.", "Registra un par de días y Bloom empezará a mostrarte patrones de energía, estrés y movimiento.", "Ver mi evolución", "Los cambios tienen más sentido cuando se comparan contigo mismo a lo largo del tiempo."],
        fr: ["Votre histoire ne fait que commencer.", "Faites quelques points dans les prochains jours et Bloom commencera à repérer vos tendances d’énergie, de stress et de mouvement.", "Voir mon évolution", "Les changements prennent tout leur sens quand on les compare à votre propre évolution."],
        pt: ["Sua história está só começando.", "Registre alguns dias e Bloom começará a mostrar padrões de energia, estresse e movimento.", "Ver minha evolução", "As mudanças fazem mais sentido quando comparadas com você ao longo do tempo."],
        en: ["Your story is just beginning.", "Check in for a few days and Bloom can start showing patterns in your energy, stress, and movement.", "See my progress", "Changes make more sense when compared with your own patterns over time."],
        it: ["La tua storia è appena iniziata.", "Registra qualche giornata e Bloom inizierà a mostrarti gli schemi di energia, stress e movimento.", "Vedi la mia evoluzione", "I cambiamenti hanno più senso se confrontati con il tuo percorso nel tempo."],
    },
    "answer.default": {
        es: ["Te escucho.", "Cuéntame qué necesitas hoy: bajar el estrés, recuperar energía, decidir qué movimiento hacer o entender cómo vas cambiando.", "Elegir una dirección", "{reason}"],
        fr: ["Je vous écoute.", "Dites-moi ce dont vous avez besoin : réduire le stress, retrouver de l’énergie, choisir un mouvement ou comprendre votre évolution.", "Choisir une direction", "{reason}"],
        pt: ["Estou aqui para ouvir.", "Conte do que você precisa: aliviar o estresse, recuperar energia, escolher um movimento ou entender suas mudanças.", "Escolher uma direção", "{reason}"],
        en: ["I’m listening.", "Tell me what you need today: ease stress, restore energy, choose a movement, or understand how you’re changing.", "Choose a direction", "{reason}"],
        it: ["Ti ascolto.", "Raccontami di cosa hai bisogno: ridurre lo stress, recuperare energia, scegliere un movimento o capire come stai cambiando.", "Scegli una direzione", "{reason}"],
    },
};

export function translateCoachMessage(key: string, locale: Locale) {
    return coachMessages[locale][key];
}

export function localizeCoachReply<T extends { id: CoachReplyId; values?: Record<string, string | number> }>(reply: T, locale: Locale): CoachReplyCopy {
    const [title, body, action, reason] = replyCopy[reply.id][locale];
    const values = reply.values ?? {};
    const render = (text: string) => text.replace(/\{([^}]+)\}/g, (_, key: string) => {
        const value = String(values[key] ?? "");
        return key === "reason" ? localizeReason(value, locale) : value;
    });
    return { title: render(title), body: render(body), action: render(action), reason: render(reason) };
}

const reasonCopy: Record<string, Record<Locale, string>> = {
    "Tu registro de hoy también apunta a una carga alta.": { es: "Tu registro de hoy también apunta a una carga alta.", fr: "Votre entrée du jour indique aussi une charge élevée.", pt: "Seu registro de hoje também indica uma carga alta.", en: "Today’s check-in also points to a high load.", it: "Anche il tuo check-in di oggi indica un carico elevato." },
    "Has preguntado por calma; podemos empezar sin exigir rendimiento.": { es: "Has preguntado por calma; podemos empezar sin exigir rendimiento.", fr: "Vous avez demandé du calme ; commençons sans chercher la performance.", pt: "Você pediu calma; podemos começar sem cobrar desempenho.", en: "You asked for calm; we can start without focusing on performance.", it: "Hai chiesto calma; possiamo iniziare senza puntare alla prestazione." },
    "Tu energía registrada está baja hoy.": { es: "Tu energía registrada está baja hoy.", fr: "Votre énergie enregistrée est basse aujourd’hui.", pt: "Sua energia registrada está baixa hoje.", en: "Your recorded energy is low today.", it: "L’energia registrata oggi è bassa." },
    "A veces la motivación aparece después de empezar, no antes.": { es: "A veces la motivación aparece después de empezar, no antes.", fr: "La motivation arrive parfois après avoir commencé, pas avant.", pt: "Às vezes, a motivação aparece depois de começar, não antes.", en: "Sometimes motivation comes after you begin, not before.", it: "A volte la motivazione arriva dopo aver iniziato, non prima." },
    "Hoy registraste {energy}/5 de energía y {stress}/5 de estrés.": { es: "Hoy registraste {energy}/5 de energía y {stress}/5 de estrés.", fr: "Aujourd’hui, vous avez noté une énergie de {energy}/5 et un stress de {stress}/5.", pt: "Hoje você registrou energia {energy}/5 e estresse {stress}/5.", en: "Today you recorded energy at {energy}/5 and stress at {stress}/5.", it: "Oggi hai registrato energia a {energy}/5 e stress a {stress}/5." },
    "Todavía no tenemos un check-in de hoy.": { es: "Todavía no tenemos un check-in de hoy.", fr: "Nous n’avons pas encore de check-in pour aujourd’hui.", pt: "Ainda não temos um check-in de hoje.", en: "We don’t have a check-in for today yet.", it: "Non abbiamo ancora un check-in per oggi." },
    "Ahora mismo: energía {energy}/5 · estrés {stress}/5.": { es: "Ahora mismo: energía {energy}/5 · estrés {stress}/5.", fr: "En ce moment : énergie {energy}/5 · stress {stress}/5.", pt: "Agora: energia {energy}/5 · estresse {stress}/5.", en: "Right now: energy {energy}/5 · stress {stress}/5.", it: "In questo momento: energia {energy}/5 · stress {stress}/5." },
    "Aún no tengo un check-in reciente para personalizar la respuesta.": { es: "Aún no tengo un check-in reciente para personalizar la respuesta.", fr: "Je n’ai pas encore de check-in récent pour personnaliser ma réponse.", pt: "Ainda não tenho um check-in recente para personalizar a resposta.", en: "I don’t have a recent check-in to personalize this reply yet.", it: "Non ho ancora un check-in recente per personalizzare la risposta." },
};

export function localizeStoredCoachMessage(message: string, locale: Locale) {
    const match = (Object.entries(replyCopy) as Array<[CoachReplyId, LocalizedReply]>)
        .find(([, translations]) => translations.es[1] === message);
    if (match) return match[1][locale][1];
    return localizeReason(message, locale);
}

function localizeReason(value: string, locale: Locale) {
    const todayMetrics = value.match(/^Hoy registraste ([\d.]+)\/5 de energía y ([\d.]+)\/5 de estrés\.$/);
    const currentMetrics = value.match(/^Ahora mismo: energía ([\d.]+)\/5 · estrés ([\d.]+)\/5\.$/);
    const template = todayMetrics
        ? reasonCopy["Hoy registraste {energy}/5 de energía y {stress}/5 de estrés."]
        : currentMetrics
            ? reasonCopy["Ahora mismo: energía {energy}/5 · estrés {stress}/5."]
            : null;
    if (template && (todayMetrics || currentMetrics)) {
        return template[locale]
            .replace("{energy}", todayMetrics?.[1] ?? currentMetrics?.[1] ?? "")
            .replace("{stress}", todayMetrics?.[2] ?? currentMetrics?.[2] ?? "");
    }
    return reasonCopy[value]?.[locale] ?? value;
}
