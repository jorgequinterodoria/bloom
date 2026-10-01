"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const LOCALES = ["es", "fr", "pt", "en", "it"] as const;
export type Locale = (typeof LOCALES)[number];

type Messages = Record<string, string>;

const messages: Record<Locale, Messages> = {
    es: {
        language: "Idioma", automatic: "Automático (según el día)", movementTitle: "Movimiento suave", movementDescription: "Un flujo corto y tranquilo para tu ánimo de hoy.", appDescription: "Registro de ánimo y movimiento suave. Tu planta crece contigo.", dashboardDescription: "Registra tu ánimo, mira crecer tu planta y empieza un movimiento suave.", invalidEmail: "Correo inválido.", shortPassword: "La contraseña debe tener al menos 8 caracteres.", emailTaken: "Ese correo ya está registrado.",
        homeTitle: "¿Cómo te sientes hoy?", signOut: "Salir", streak: "Racha", days: "días", energy: "Energía", reminder: "Recordatorio",
        reminderStreak: "Muy buena racha: mantén la constancia.", reminderStress: "Hoy parece un día con más carga. Un pequeño movimiento suave puede ayudar.", reminderPause: "Un minuto de pausa hoy también cuenta como progreso.",
        loadDayError: "No pudimos cargar tu día.", retry: "Reintentar", loadingDay: "Cargando tu día…", checkinThanks: "Gracias por registrar cómo te sientes. Tu planta ha crecido un poco más.", rideThanks: "Paseo registrado. Disfruta el resto del fin de semana.",
        todayContext: "Qué está pasando hoy", stress: "Estrés", shortNote: "Nota breve", notePlaceholder: "Añade un detalle útil para tu día", week: "Tu semana", noRecord: "Sin registro", streakDays: "Racha {count} días", avgEnergy: "Promedio de energía", avgStress: "Estrés medio",
        monthSummary: "Resumen del mes", monthLog: "Registro del mes", bestMood: "Ánimo más frecuente", noData: "Sin datos", monthGoal: "Meta semanal", solidStreak: "Racha sólida", severalDays: "Ya llevas varios días de constancia.", startStreak: "Registra hoy para empezar tu constancia.", stableEnergy: "Energía estable", energyGood: "Tu energía media está en buen nivel.", recharge: "Recarga", energyRest: "Un descanso o paseo suave te puede ayudar.", controlledLoad: "Carga controlada", stressReduced: "La tensión media está rebajada.", breathe: "Respira", stressRelease: "Prueba cinco minutos de pausa para aliviar la presión.", habitsImprove: "Tus hábitos van mejorando poco a poco.", reminders: "Recordatorios", consistency: "Constancia", streakMessage: "Tu racha está bien: sigue registrando aunque sea un pequeño paso.", monthlyGoal: "Meta del mes", monthComplete: "Llevas {rate}% del mes completado.", usefulHint: "Pista útil", gentleMovement: "Tres minutos de movimiento suave hoy te ayudan a sostener mejor el resto del día.", highLoad: "Carga alta", highStressMessage: "Tu nivel de estrés está elevado. Un paseo corto puede marcar la diferencia.",
        welcome: "Bienvenida", bloomSupports: "Bloom te acompaña", understood: "Entendido", onboarding: "Registra tu ánimo, cuida tu energía, practica un movimiento suave y mira cómo tu planta va creciendo contigo.", urgentHelp: "Ayuda urgente (SOS)",
        weekend: "Fin de semana", weekendAria: "Fin de semana", shortWalk: "Paseo corto", freshAir: "10–15 min al aire libre", easyBike: "Bici suave", steadyMovement: "Movimiento tranquilo y constante", activeRest: "Descanso activo", unhurriedWalk: "Caminar sin prisa y respirar", weekendIntro: "Un paseo al aire libre también hace crecer tu planta. Elige la forma que mejor te siente.", recordRide: "Registrar paseo del fin de semana", moodAria: "Registro de ánimo",
        moodStressed: "Estresada", moodStressedHint: "Soltar tensión", moodAnxious: "Ansiosa", moodAnxiousHint: "Bajar revoluciones", moodEnergetic: "Energética", moodEnergeticHint: "Usar la energía", moodUnmotivated: "Sin motivación", moodUnmotivatedHint: "Empezar despacio",
        calmMode: "Modo calma", close: "Cerrar", calmIntro: "Si necesitas apoyo ahora mismo, puedes respirar, pedir compañía o tomar una pausa breve sin culpa.", talkSomeone: "Hablar con alguien", breatheWithMe: "Respirar conmigo", externalSupport: "Apoyo externo", breathingGuide: "Respira siguiendo el círculo: inhala lentamente y exhala despacio.", calmTip: "Prueba un batido de plátano con proteína: plátano, una cucharada de proteína en polvo, leche o agua y unas nueces. Dulce, suave y sin prisa.",
        session: "Tu sesión", moodStressedSummary: "Hoy tu objetivo es soltar tensión con calma y sin empujones.", moodAnxiousSummary: "Hoy prioriza una respiración lenta y un ritmo suave.", moodEnergeticSummary: "Tu energía está buena; usa ese impulso con movimientos controlados.", moodUnmotivatedSummary: "Empieza con lo mínimo y deja que la rutina te dé impulso.", genericMoodSummary: "Hoy das un pequeño paso con atención y sin exigirte mucho.", progressExercise: "Progreso del ejercicio", exerciseNumber: "Ejercicio {current} de {total}", resume: "Reanudar", pause: "Pausar", nextMove: "Siguiente movimiento", seconds: "s", movementReady: "Preparando tu movimiento…", flowMissing: "No encontramos tu flujo de hoy.", backHome: "Volver al inicio", doneToday: "Listo por hoy", plantWaiting: "Tu planta te espera en casa.", saveProgressError: "No pudimos guardar tu avance.", movementError: "Algo salió mal al cargar tu movimiento.",
        loginTitle: "Iniciar sesión", loginDescription: "Entra a Bloom con tu correo y contraseña.", loginIntro: "Entra para cuidar tu planta y tu movimiento.", email: "Correo", password: "Contraseña", login: "Entrar", loggingIn: "Entrando…", invalidCredentials: "Correo o contraseña incorrectos.", serverError: "Error del servidor. Intenta de nuevo.", loginError: "No se pudo iniciar sesión. Revisa tu conexión.", noAccount: "¿Aún no tienes cuenta?", createOne: "Crear una",
        registerTitle: "Crear cuenta", registerDescription: "Crea tu cuenta de Bloom en segundos.", registerIntro: "Crea tu cuenta para empezar a crecer.", createAccount: "Crear cuenta", creatingAccount: "Creando…", registerError: "No se pudo crear la cuenta.", minPassword: "Mínimo 8 caracteres.", hasAccount: "¿Ya tienes cuenta?",
        plantAlt: "Planta de Bloom — etapa {stage} de {max}",
        moodStoredStressed: "Estresada", moodStoredAnxious: "Ansiosa", moodStoredEnergetic: "Energética", moodStoredUnmotivated: "Sin motivación"
    },
    fr: {
        language: "Langue", automatic: "Automatique (selon le jour)", movementTitle: "Mouvement doux", movementDescription: "Une courte séance tranquille adaptée à votre humeur.", appDescription: "Suivi de l’humeur et mouvement doux. Votre plante grandit avec vous.", dashboardDescription: "Suivez votre humeur, regardez votre plante grandir et commencez un mouvement doux.", invalidEmail: "Adresse e-mail invalide.", shortPassword: "Le mot de passe doit contenir au moins 8 caractères.", emailTaken: "Cette adresse e-mail est déjà utilisée.",
        homeTitle: "Comment vous sentez-vous aujourd’hui ?", signOut: "Déconnexion", streak: "Série", days: "jours", energy: "Énergie", reminder: "Rappel",
        reminderStreak: "Belle série : gardez le rythme.", reminderStress: "La journée semble chargée. Un mouvement doux peut aider.", reminderPause: "Une minute de pause aujourd’hui compte aussi comme un progrès.",
        loadDayError: "Impossible de charger votre journée.", retry: "Réessayer", loadingDay: "Chargement de votre journée…", checkinThanks: "Merci d’avoir partagé votre ressenti. Votre plante a encore grandi.", rideThanks: "Balade enregistrée. Profitez du reste du week-end.",
        todayContext: "Comment ça va aujourd’hui ?", stress: "Stress", shortNote: "Petite note", notePlaceholder: "Ajoutez un détail utile pour votre journée", week: "Votre semaine", noRecord: "Aucune entrée", streakDays: "Série de {count} jours", avgEnergy: "Énergie moyenne", avgStress: "Stress moyen",
        monthSummary: "Bilan du mois", monthLog: "Suivi du mois", bestMood: "Humeur la plus fréquente", noData: "Pas de données", monthGoal: "Objectif hebdomadaire", solidStreak: "Belle régularité", severalDays: "Vous êtes régulier depuis plusieurs jours.", startStreak: "Faites une entrée aujourd’hui pour commencer votre série.", stableEnergy: "Énergie stable", energyGood: "Votre énergie moyenne est bonne.", recharge: "Recharge", energyRest: "Une pause ou une balade tranquille peut aider.", controlledLoad: "Charge maîtrisée", stressReduced: "Votre tension moyenne a baissé.", breathe: "Respirez", stressRelease: "Essayez cinq minutes de pause pour relâcher la pression.", habitsImprove: "Vos habitudes progressent petit à petit.", reminders: "Rappels", consistency: "Régularité", streakMessage: "Votre série avance : continuez, même avec un tout petit pas.", monthlyGoal: "Objectif du mois", monthComplete: "Vous avez complété {rate} % du mois.", usefulHint: "Petit conseil", gentleMovement: "Trois minutes de mouvement doux aujourd’hui peuvent vous aider pour le reste de la journée.", highLoad: "Charge élevée", highStressMessage: "Votre stress est élevé. Une courte promenade peut faire la différence.",
        welcome: "Bienvenue", bloomSupports: "Bloom vous accompagne", understood: "Compris", onboarding: "Notez votre humeur, prenez soin de votre énergie, bougez doucement et regardez votre plante grandir avec vous.", urgentHelp: "Aide urgente (SOS)",
        weekend: "Week-end", weekendAria: "Week-end", shortWalk: "Petite balade", freshAir: "10 à 15 min au grand air", easyBike: "Vélo tranquille", steadyMovement: "Un mouvement calme et régulier", activeRest: "Repos actif", unhurriedWalk: "Marcher sans se presser et respirer", weekendIntro: "Une balade au grand air aide aussi votre plante à grandir. Choisissez ce qui vous convient.", recordRide: "Enregistrer la balade du week-end", moodAria: "Suivi de l’humeur",
        moodStressed: "Stressé·e", moodStressedHint: "Relâcher la tension", moodAnxious: "Anxieux·se", moodAnxiousHint: "Ralentir le rythme", moodEnergetic: "Énergique", moodEnergeticHint: "Canaliser l’énergie", moodUnmotivated: "Sans motivation", moodUnmotivatedHint: "Commencer doucement",
        calmMode: "Mode apaisement", close: "Fermer", calmIntro: "Si vous avez besoin de soutien maintenant, vous pouvez respirer, demander de la compagnie ou faire une courte pause sans culpabiliser.", talkSomeone: "Parler à quelqu’un", breatheWithMe: "Respirer avec moi", externalSupport: "Aide extérieure", breathingGuide: "Respirez avec le cercle : inspirez lentement, puis expirez doucement.", calmTip: "Essayez un smoothie banane-protéines : une banane, une dose de protéines en poudre, du lait ou de l’eau et quelques noix. Doux et sans se presser.",
        session: "Votre séance", moodStressedSummary: "Aujourd’hui, relâchez la tension tranquillement, sans vous forcer.", moodAnxiousSummary: "Privilégiez une respiration lente et un rythme doux aujourd’hui.", moodEnergeticSummary: "Votre énergie est bonne ; canalisez-la avec des mouvements maîtrisés.", moodUnmotivatedSummary: "Commencez par le minimum et laissez la routine vous porter.", genericMoodSummary: "Aujourd’hui, faites un petit pas en pleine conscience, sans trop en demander.", progressExercise: "Progression de l’exercice", exerciseNumber: "Exercice {current} sur {total}", resume: "Reprendre", pause: "Pause", nextMove: "Mouvement suivant", seconds: "s", movementReady: "Préparation de votre séance…", flowMissing: "Votre séance du jour est introuvable.", backHome: "Retour à l’accueil", doneToday: "C’est tout pour aujourd’hui", plantWaiting: "Votre plante vous attend à l’accueil.", saveProgressError: "Impossible d’enregistrer votre progression.", movementError: "Une erreur est survenue lors du chargement de votre séance.",
        loginTitle: "Connexion", loginDescription: "Connectez-vous à Bloom avec votre adresse e-mail et votre mot de passe.", loginIntro: "Connectez-vous pour prendre soin de votre plante et bouger.", email: "E-mail", password: "Mot de passe", login: "Se connecter", loggingIn: "Connexion…", invalidCredentials: "Adresse e-mail ou mot de passe incorrect.", serverError: "Erreur du serveur. Réessayez.", loginError: "Connexion impossible. Vérifiez votre réseau.", noAccount: "Vous n’avez pas encore de compte ?", createOne: "En créer un",
        registerTitle: "Créer un compte", registerDescription: "Créez votre compte Bloom en quelques secondes.", registerIntro: "Créez votre compte pour commencer à grandir.", createAccount: "Créer un compte", creatingAccount: "Création…", registerError: "Impossible de créer le compte.", minPassword: "8 caractères minimum.", hasAccount: "Vous avez déjà un compte ?",
        plantAlt: "Plante Bloom — étape {stage} sur {max}", moodStoredStressed: "Stressé·e", moodStoredAnxious: "Anxieux·se", moodStoredEnergetic: "Énergique", moodStoredUnmotivated: "Sans motivation"
    },
    pt: {
        language: "Idioma", automatic: "Automático (conforme o dia)", movementTitle: "Movimento leve", movementDescription: "Uma sequência curta e tranquila para o seu humor hoje.", appDescription: "Registro de humor e movimento leve. Sua planta cresce com você.", dashboardDescription: "Registre seu humor, veja sua planta crescer e comece um movimento leve.", invalidEmail: "E-mail inválido.", shortPassword: "A senha precisa ter pelo menos 8 caracteres.", emailTaken: "Este e-mail já está cadastrado.",
        homeTitle: "Como você está se sentindo hoje?", signOut: "Sair", streak: "Sequência", days: "dias", energy: "Energia", reminder: "Lembrete",
        reminderStreak: "Ótima sequência: mantenha a constância.", reminderStress: "Hoje parece um dia mais puxado. Um movimento leve pode ajudar.", reminderPause: "Um minuto de pausa hoje também conta como progresso.",
        loadDayError: "Não foi possível carregar seu dia.", retry: "Tentar novamente", loadingDay: "Carregando seu dia…", checkinThanks: "Obrigado por compartilhar como você se sente. Sua planta cresceu mais um pouco.", rideThanks: "Caminhada registrada. Aproveite o resto do fim de semana.",
        todayContext: "Como está seu dia", stress: "Estresse", shortNote: "Nota breve", notePlaceholder: "Adicione um detalhe útil para o seu dia", week: "Sua semana", noRecord: "Sem registro", streakDays: "Sequência de {count} dias", avgEnergy: "Energia média", avgStress: "Estresse médio",
        monthSummary: "Resumo do mês", monthLog: "Registros do mês", bestMood: "Humor mais frequente", noData: "Sem dados", monthGoal: "Meta semanal", solidStreak: "Boa constância", severalDays: "Você já mantém a constância há vários dias.", startStreak: "Registre hoje para começar sua sequência.", stableEnergy: "Energia estável", energyGood: "Sua energia média está em um bom nível.", recharge: "Recarga", energyRest: "Uma pausa ou caminhada leve pode ajudar.", controlledLoad: "Carga controlada", stressReduced: "Sua tensão média diminuiu.", breathe: "Respire", stressRelease: "Faça uma pausa de cinco minutos para aliviar a pressão.", habitsImprove: "Seus hábitos estão melhorando aos poucos.", reminders: "Lembretes", consistency: "Constância", streakMessage: "Sua sequência está indo bem: continue registrando, mesmo que seja um pequeno passo.", monthlyGoal: "Meta do mês", monthComplete: "Você completou {rate}% do mês.", usefulHint: "Dica útil", gentleMovement: "Três minutos de movimento leve hoje podem ajudar no resto do dia.", highLoad: "Carga alta", highStressMessage: "Seu estresse está elevado. Uma caminhada curta pode fazer diferença.",
        welcome: "Boas-vindas", bloomSupports: "A Bloom acompanha você", understood: "Entendi", onboarding: "Registre seu humor, cuide da sua energia, pratique um movimento leve e veja sua planta crescer com você.", urgentHelp: "Ajuda urgente (SOS)",
        weekend: "Fim de semana", weekendAria: "Fim de semana", shortWalk: "Caminhada curta", freshAir: "10–15 min ao ar livre", easyBike: "Pedalada leve", steadyMovement: "Movimento tranquilo e constante", activeRest: "Descanso ativo", unhurriedWalk: "Caminhar sem pressa e respirar", weekendIntro: "Uma caminhada ao ar livre também faz sua planta crescer. Escolha o que combina com você.", recordRide: "Registrar passeio do fim de semana", moodAria: "Registro de humor",
        moodStressed: "Estressada", moodStressedHint: "Aliviar a tensão", moodAnxious: "Ansiosa", moodAnxiousHint: "Desacelerar", moodEnergetic: "Com energia", moodEnergeticHint: "Usar a energia", moodUnmotivated: "Sem motivação", moodUnmotivatedHint: "Começar devagar",
        calmMode: "Modo de calma", close: "Fechar", calmIntro: "Se você precisa de apoio agora, pode respirar, pedir companhia ou fazer uma pausa breve sem culpa.", talkSomeone: "Conversar com alguém", breatheWithMe: "Respire comigo", externalSupport: "Apoio externo", breathingGuide: "Respire seguindo o círculo: inspire lentamente e expire devagar.", calmTip: "Experimente uma vitamina de banana com proteína: banana, uma dose de proteína em pó, leite ou água e algumas nozes. Doce, leve e sem pressa.",
        session: "Sua sessão", moodStressedSummary: "Hoje, seu objetivo é aliviar a tensão com calma e sem pressão.", moodAnxiousSummary: "Hoje, priorize uma respiração lenta e um ritmo suave.", moodEnergeticSummary: "Sua energia está boa; aproveite o impulso com movimentos controlados.", moodUnmotivatedSummary: "Comece pelo mínimo e deixe a rotina trazer o impulso.", genericMoodSummary: "Hoje, dê um pequeno passo com atenção e sem se cobrar demais.", progressExercise: "Progresso do exercício", exerciseNumber: "Exercício {current} de {total}", resume: "Continuar", pause: "Pausar", nextMove: "Próximo movimento", seconds: "s", movementReady: "Preparando seu movimento…", flowMissing: "Não encontramos sua sequência de hoje.", backHome: "Voltar ao início", doneToday: "Por hoje, está feito", plantWaiting: "Sua planta espera por você em casa.", saveProgressError: "Não foi possível salvar seu progresso.", movementError: "Algo deu errado ao carregar seu movimento.",
        loginTitle: "Entrar", loginDescription: "Acesse a Bloom com seu e-mail e senha.", loginIntro: "Entre para cuidar da sua planta e do seu movimento.", email: "E-mail", password: "Senha", login: "Entrar", loggingIn: "Entrando…", invalidCredentials: "E-mail ou senha incorretos.", serverError: "Erro no servidor. Tente novamente.", loginError: "Não foi possível entrar. Verifique sua conexão.", noAccount: "Ainda não tem uma conta?", createOne: "Criar uma",
        registerTitle: "Criar conta", registerDescription: "Crie sua conta Bloom em segundos.", registerIntro: "Crie sua conta para começar a crescer.", createAccount: "Criar conta", creatingAccount: "Criando…", registerError: "Não foi possível criar a conta.", minPassword: "Mínimo de 8 caracteres.", hasAccount: "Já tem uma conta?",
        plantAlt: "Planta da Bloom — estágio {stage} de {max}", moodStoredStressed: "Estressada", moodStoredAnxious: "Ansiosa", moodStoredEnergetic: "Energética", moodStoredUnmotivated: "Sem motivação"
    },
    en: {
        language: "Language", automatic: "Automatic (by day)", movementTitle: "Gentle movement", movementDescription: "A short, calm routine for how you feel today.", appDescription: "Mood check-ins and gentle movement. Your plant grows with you.", dashboardDescription: "Check in with your mood, watch your plant grow, and start a gentle movement.", invalidEmail: "Invalid email address.", shortPassword: "Your password must be at least 8 characters.", emailTaken: "That email is already registered.",
        homeTitle: "How are you feeling today?", signOut: "Sign out", streak: "Streak", days: "days", energy: "Energy", reminder: "Reminder",
        reminderStreak: "A lovely streak. Keep showing up.", reminderStress: "Today seems demanding. A little gentle movement may help.", reminderPause: "A minute to pause today counts as progress too.",
        loadDayError: "We couldn’t load your day.", retry: "Try again", loadingDay: "Loading your day…", checkinThanks: "Thanks for checking in. Your plant has grown a little more.", rideThanks: "Walk recorded. Enjoy the rest of your weekend.",
        todayContext: "How today is going", stress: "Stress", shortNote: "A short note", notePlaceholder: "Add a helpful detail about your day", week: "Your week", noRecord: "No check-in", streakDays: "{count}-day streak", avgEnergy: "Average energy", avgStress: "Average stress",
        monthSummary: "Monthly summary", monthLog: "Monthly check-ins", bestMood: "Most frequent mood", noData: "No data", monthGoal: "Weekly goal", solidStreak: "Strong streak", severalDays: "You’ve shown up consistently for several days.", startStreak: "Check in today to start your streak.", stableEnergy: "Steady energy", energyGood: "Your average energy is in a good place.", recharge: "Recharge", energyRest: "A rest or gentle walk may help.", controlledLoad: "Manageable load", stressReduced: "Your average tension is lower.", breathe: "Take a breath", stressRelease: "Try a five-minute pause to ease the pressure.", habitsImprove: "Your habits are improving a little at a time.", reminders: "Reminders", consistency: "Consistency", streakMessage: "Your streak is going well. Keep checking in, even with one small step.", monthlyGoal: "Monthly goal", monthComplete: "You’ve completed {rate}% of the month.", usefulHint: "A helpful nudge", gentleMovement: "Three minutes of gentle movement today can support the rest of your day.", highLoad: "High load", highStressMessage: "Your stress is elevated. A short walk can make a difference.",
        welcome: "Welcome", bloomSupports: "Bloom is here with you", understood: "Got it", onboarding: "Check in with your mood, care for your energy, try a gentle movement, and watch your plant grow with you.", urgentHelp: "Urgent support (SOS)",
        weekend: "Weekend", weekendAria: "Weekend", shortWalk: "Short walk", freshAir: "10–15 min outdoors", easyBike: "Easy cycling", steadyMovement: "Calm, steady movement", activeRest: "Active rest", unhurriedWalk: "Walk slowly and breathe", weekendIntro: "A little fresh air helps your plant grow, too. Choose what feels right for you.", recordRide: "Log a weekend walk", moodAria: "Mood check-in",
        moodStressed: "Stressed", moodStressedHint: "Release tension", moodAnxious: "Anxious", moodAnxiousHint: "Slow things down", moodEnergetic: "Energetic", moodEnergeticHint: "Use your energy", moodUnmotivated: "Unmotivated", moodUnmotivatedHint: "Start gently",
        calmMode: "Calm mode", close: "Close", calmIntro: "If you need support right now, you can breathe, ask someone to stay with you, or take a short break without guilt.", talkSomeone: "Talk to someone", breatheWithMe: "Breathe with me", externalSupport: "Outside support", breathingGuide: "Breathe with the circle: inhale slowly, then exhale gently.", calmTip: "Try a banana protein smoothie: a banana, one scoop of protein powder, milk or water, and a few nuts. Sweet, gentle, and unhurried.",
        session: "Your session", moodStressedSummary: "Today, focus on easing tension gently, without pushing yourself.", moodAnxiousSummary: "Prioritize slow breathing and a gentle pace today.", moodEnergeticSummary: "Your energy is good; channel it with controlled movements.", moodUnmotivatedSummary: "Start with the smallest step and let the routine build momentum.", genericMoodSummary: "Take one small, mindful step today without asking too much of yourself.", progressExercise: "Exercise progress", exerciseNumber: "Exercise {current} of {total}", resume: "Resume", pause: "Pause", nextMove: "Next movement", seconds: "s", movementReady: "Getting your movement ready…", flowMissing: "We couldn’t find today’s routine.", backHome: "Back to home", doneToday: "That’s enough for today", plantWaiting: "Your plant is waiting for you at home.", saveProgressError: "We couldn’t save your progress.", movementError: "Something went wrong while loading your movement.",
        loginTitle: "Sign in", loginDescription: "Sign in to Bloom with your email and password.", loginIntro: "Sign in to care for your plant and get moving.", email: "Email", password: "Password", login: "Sign in", loggingIn: "Signing in…", invalidCredentials: "Incorrect email or password.", serverError: "Server error. Please try again.", loginError: "Couldn’t sign in. Check your connection.", noAccount: "Don’t have an account yet?", createOne: "Create one",
        registerTitle: "Create account", registerDescription: "Create your Bloom account in seconds.", registerIntro: "Create an account and start growing.", createAccount: "Create account", creatingAccount: "Creating…", registerError: "We couldn’t create your account.", minPassword: "At least 8 characters.", hasAccount: "Already have an account?",
        plantAlt: "Bloom plant — stage {stage} of {max}", moodStoredStressed: "Stressed", moodStoredAnxious: "Anxious", moodStoredEnergetic: "Energetic", moodStoredUnmotivated: "Unmotivated"
    },
    it: {
        language: "Lingua", automatic: "Automatico (in base al giorno)", movementTitle: "Movimento leggero", movementDescription: "Una breve routine tranquilla per il tuo umore di oggi.", appDescription: "Check-in dell’umore e movimento leggero. La tua pianta cresce con te.", dashboardDescription: "Registra il tuo umore, guarda crescere la tua pianta e inizia un movimento leggero.", invalidEmail: "Indirizzo e-mail non valido.", shortPassword: "La password deve contenere almeno 8 caratteri.", emailTaken: "Questo indirizzo e-mail è già registrato.",
        homeTitle: "Come ti senti oggi?", signOut: "Esci", streak: "Costanza", days: "giorni", energy: "Energia", reminder: "Promemoria",
        reminderStreak: "Ottima costanza: continua così.", reminderStress: "Oggi sembra una giornata intensa. Un po’ di movimento leggero può aiutare.", reminderPause: "Anche un minuto di pausa oggi è un progresso.",
        loadDayError: "Non siamo riusciti a caricare la tua giornata.", retry: "Riprova", loadingDay: "Caricamento della giornata…", checkinThanks: "Grazie per aver condiviso come ti senti. La tua pianta è cresciuta ancora un po’.", rideThanks: "Passeggiata registrata. Goditi il resto del fine settimana.",
        todayContext: "Come va oggi", stress: "Stress", shortNote: "Nota breve", notePlaceholder: "Aggiungi un dettaglio utile per la tua giornata", week: "La tua settimana", noRecord: "Nessun dato", streakDays: "Costanza per {count} giorni", avgEnergy: "Energia media", avgStress: "Stress medio",
        monthSummary: "Riepilogo del mese", monthLog: "Check-in del mese", bestMood: "Umore più frequente", noData: "Nessun dato", monthGoal: "Obiettivo settimanale", solidStreak: "Ottima costanza", severalDays: "Mantieni la costanza da diversi giorni.", startStreak: "Fai check-in oggi per iniziare la tua serie.", stableEnergy: "Energia stabile", energyGood: "La tua energia media è a un buon livello.", recharge: "Ricaricati", energyRest: "Una pausa o una passeggiata leggera possono aiutarti.", controlledLoad: "Carico sotto controllo", stressReduced: "La tensione media è diminuita.", breathe: "Respira", stressRelease: "Prova una pausa di cinque minuti per allentare la pressione.", habitsImprove: "Le tue abitudini migliorano un po’ alla volta.", reminders: "Promemoria", consistency: "Costanza", streakMessage: "La tua costanza procede bene: continua, anche con un piccolo passo.", monthlyGoal: "Obiettivo del mese", monthComplete: "Hai completato il {rate}% del mese.", usefulHint: "Un consiglio utile", gentleMovement: "Tre minuti di movimento leggero oggi possono sostenerti per il resto della giornata.", highLoad: "Carico elevato", highStressMessage: "Il tuo stress è alto. Una breve passeggiata può fare la differenza.",
        welcome: "Benvenuta", bloomSupports: "Bloom è al tuo fianco", understood: "Ho capito", onboarding: "Registra il tuo umore, prenditi cura della tua energia, prova un movimento leggero e guarda la tua pianta crescere con te.", urgentHelp: "Aiuto urgente (SOS)",
        weekend: "Fine settimana", weekendAria: "Fine settimana", shortWalk: "Passeggiata breve", freshAir: "10–15 min all’aperto", easyBike: "Bicicletta leggera", steadyMovement: "Movimento tranquillo e costante", activeRest: "Riposo attivo", unhurriedWalk: "Camminare senza fretta e respirare", weekendIntro: "Anche una passeggiata all’aperto fa crescere la tua pianta. Scegli ciò che ti fa stare meglio.", recordRide: "Registra la passeggiata del fine settimana", moodAria: "Check-in dell’umore",
        moodStressed: "Stressata", moodStressedHint: "Allentare la tensione", moodAnxious: "Ansiosa", moodAnxiousHint: "Rallentare il ritmo", moodEnergetic: "Energica", moodEnergeticHint: "Usare l’energia", moodUnmotivated: "Senza motivazione", moodUnmotivatedHint: "Iniziare con calma",
        calmMode: "Modalità calma", close: "Chiudi", calmIntro: "Se hai bisogno di supporto adesso, puoi respirare, chiedere compagnia o fare una breve pausa senza sentirti in colpa.", talkSomeone: "Parla con qualcuno", breatheWithMe: "Respira con me", externalSupport: "Supporto esterno", breathingGuide: "Respira seguendo il cerchio: inspira lentamente ed espira piano.", calmTip: "Prova un frullato di banana e proteine: una banana, un misurino di proteine in polvere, latte o acqua e qualche noce. Dolce, delicato e senza fretta.",
        session: "La tua sessione", moodStressedSummary: "Oggi punta a sciogliere la tensione con calma, senza sforzarti.", moodAnxiousSummary: "Oggi dai la priorità a un respiro lento e a un ritmo tranquillo.", moodEnergeticSummary: "Hai una buona energia; usala con movimenti controllati.", moodUnmotivatedSummary: "Inizia dal minimo e lascia che sia la routine a darti slancio.", genericMoodSummary: "Oggi fai un piccolo passo con attenzione, senza pretendere troppo da te.", progressExercise: "Progresso dell’esercizio", exerciseNumber: "Esercizio {current} di {total}", resume: "Riprendi", pause: "Pausa", nextMove: "Movimento successivo", seconds: "s", movementReady: "Preparazione del movimento…", flowMissing: "Non abbiamo trovato il programma di oggi.", backHome: "Torna all’inizio", doneToday: "Per oggi è abbastanza", plantWaiting: "La tua pianta ti aspetta a casa.", saveProgressError: "Non siamo riusciti a salvare i tuoi progressi.", movementError: "Si è verificato un errore durante il caricamento del movimento.",
        loginTitle: "Accedi", loginDescription: "Accedi a Bloom con e-mail e password.", loginIntro: "Accedi per prenderti cura della tua pianta e muoverti.", email: "E-mail", password: "Password", login: "Accedi", loggingIn: "Accesso…", invalidCredentials: "E-mail o password non corrette.", serverError: "Errore del server. Riprova.", loginError: "Impossibile accedere. Controlla la connessione.", noAccount: "Non hai ancora un account?", createOne: "Creane uno",
        registerTitle: "Crea un account", registerDescription: "Crea il tuo account Bloom in pochi secondi.", registerIntro: "Crea un account e inizia a crescere.", createAccount: "Crea account", creatingAccount: "Creazione…", registerError: "Non siamo riusciti a creare l’account.", minPassword: "Almeno 8 caratteri.", hasAccount: "Hai già un account?",
        plantAlt: "Pianta Bloom — fase {stage} di {max}", moodStoredStressed: "Stressata", moodStoredAnxious: "Ansiosa", moodStoredEnergetic: "Energica", moodStoredUnmotivated: "Senza motivazione"
    },
};

const localeNames: Record<Locale, string> = { es: "Español", fr: "Français", pt: "Português", en: "English", it: "Italiano" };
const preferenceKey = "bloom-locale";

export function localeForDay(date = new Date()): Locale {
    const rotation: Locale[] = ["fr", "es", "fr", "pt", "en", "it", "es"];
    return rotation[date.getDay()];
}

interface I18nContextValue {
    locale: Locale;
    automatic: boolean;
    setLanguage: (value: string) => void;
    t: (key: string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
    locale: "es",
    automatic: true,
    setLanguage: () => undefined,
    t: (key, values = {}) => Object.entries(values).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        messages.es[key] ?? key,
    ),
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [locale, setLocale] = useState<Locale>("es");
    const [automatic, setAutomatic] = useState(true);

    useEffect(() => {
        const saved = window.localStorage.getItem(preferenceKey);
        if (saved && LOCALES.includes(saved as Locale)) {
            setLocale(saved as Locale);
            setAutomatic(false);
        } else {
            setLocale(localeForDay());
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale;
        const path = pathname ?? window.location.pathname;
        const titleKey = path.startsWith("/login") ? "loginTitle"
            : path.startsWith("/register") ? "registerTitle"
                : path.startsWith("/move") ? "movementTitle"
                    : "homeTitle";
        const descriptionKey = path.startsWith("/login") ? "loginDescription"
            : path.startsWith("/register") ? "registerDescription"
                : path.startsWith("/move") ? "movementDescription"
                    : path === "/" ? "dashboardDescription"
                        : "appDescription";
        document.title = `${messages[locale][titleKey] ?? messages.es[titleKey]} · Bloom`;
        document.querySelector('meta[name="description"]')?.setAttribute("content", messages[locale][descriptionKey] ?? messages.es[descriptionKey]);
    }, [locale, pathname]);

    useEffect(() => {
        if (!automatic) return;
        const refresh = () => setLocale(localeForDay());
        const timer = window.setInterval(refresh, 60_000);
        window.addEventListener("focus", refresh);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener("focus", refresh);
        };
    }, [automatic]);

    function setLanguage(value: string) {
        if (value === "auto") {
            window.localStorage.removeItem(preferenceKey);
            setLocale(localeForDay());
            setAutomatic(true);
            return;
        }
        if (LOCALES.includes(value as Locale)) {
            window.localStorage.setItem(preferenceKey, value);
            setLocale(value as Locale);
            setAutomatic(false);
        }
    }

    function t(key: string, values: Record<string, string | number> = {}) {
        return Object.entries(values).reduce(
            (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
            messages[locale][key] ?? messages.es[key] ?? key,
        );
    }

    return (
        <I18nContext.Provider value={{ locale, automatic, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}

export function LocalizedMessage({ messageKey, className }: { messageKey: string; className?: string }) {
    const { t } = useI18n();
    return <p className={className}>{t(messageKey)}</p>;
}

export function LanguageSwitcher() {
    const { locale, automatic, setLanguage, t } = useI18n();
    return (
        <label className="flex items-center justify-end gap-2 py-3 text-xs text-ink-muted">
            <span>{t("language")}</span>
            <select
                aria-label={t("language")}
                value={automatic ? "auto" : locale}
                onChange={(event) => setLanguage(event.target.value)}
                className="max-w-44 rounded-lg border border-surface-raised bg-surface px-2 py-1.5 text-ink"
            >
                <option value="auto">{t("automatic")}</option>
                {LOCALES.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
            </select>
        </label>
    );
}

export function translatedMood(mood: string, locale: Locale, t: (key: string) => string) {
    const keys: Record<string, string> = {
        Estresada: "moodStoredStressed", Ansiosa: "moodStoredAnxious", Energética: "moodStoredEnergetic", "Sin motivación": "moodStoredUnmotivated",
    };
    return keys[mood] ? t(keys[mood]) : mood;
}
