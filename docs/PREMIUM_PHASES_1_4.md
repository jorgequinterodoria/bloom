# Bloom — Implementación Premium Fases 1–4

Esta entrega implementa las primeras cuatro fases de la evolución premium de Bloom sobre la base existente.

## Fase 1 — Premium Visual
- Home rediseñado alrededor de “Bloom para hoy”.
- Navegación inferior: Hoy, Moverme, Jardín, Evolución.
- Night Bloom / tema nocturno.
- Jerarquía visual y estados vacíos/carga más refinados.
- PlantGrowth con gradientes, brillo y presentación compacta.
- PWA/Service Worker actualizado a caché v2.

## Fase 2 — Premium UX
- Onboarding de 3 pasos.
- Tarjeta de check-in con energía, estrés, nota y mood.
- Recommendation Card.
- Workout Player con transición de 3 segundos, audio opcional y resumen final.
- Registro Before/After de energía y estrés.
- Persistencia de sesiones en `workout_sessions`.
- Cola offline para check-ins/acciones pendientes.
- `OfflineSync` para sincronización al volver la conexión.

## Fase 3 — Personalización
- Motor de recomendaciones por estrés, energía, tendencias y duración preferida.
- Perfil de usuario con foco y duración preferida.
- Insights 7/30/90 días.
- Patrones de estrés/energía y sesiones recientes.
- Objetivos configurables.

## Fase 4 — Bloom Garden
- Pantalla Jardín dedicada.
- Progreso de planta basado en días de cuidado, sesiones y minutos.
- Logros persistentes.
- Sincronización automática de logros al completar check-ins/sesiones/ride.
- Semillas de logros iniciales.

## Archivos creados/actualizados

### Base de datos
- `drizzle/0002_bloom_premium.sql`
- `drizzle/meta/_journal.json`
- `src/lib/db/schema.ts`
- `src/lib/db/premium.ts`

### APIs
- `src/app/api/checkin/route.ts`
- `src/app/api/exercises/route.ts`
- `src/app/api/goals/route.ts`
- `src/app/api/insights/route.ts`
- `src/app/api/plant/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/recommendation/route.ts`
- `src/app/api/ride/route.ts`
- `src/app/api/session/route.ts`

### Páginas / layout
- `src/app/(dashboard)/garden/page.tsx`
- `src/app/(dashboard)/insights/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/layout.tsx`
- `src/app/manifest.ts`

### Componentes
- `src/components/HomeScreen.tsx`
- `src/components/HomeScreen.test.tsx`
- `src/components/OfflineSync.tsx`
- `src/components/ThemeToggle.tsx`
- `src/components/dashboard/CheckinCard.tsx`
- `src/components/dashboard/RecommendationCard.tsx`
- `src/components/garden/GardenScreen.tsx`
- `src/components/insights/InsightsScreen.tsx`
- `src/components/navigation/AppNav.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/components/plant/PlantGrowth.tsx`
- `src/components/workout/WorkoutPlayer.tsx`
- `src/components/workout/WorkoutPlayer.test.tsx`

### Librerías internas
- `src/lib/db/premium.ts`
- `src/lib/i18n.tsx`
- `src/lib/offline.ts`
- `src/lib/recommendations.ts`
- `src/lib/recommendations.test.ts`
- `src/lib/sounds.ts`

### PWA / estilos
- `public/sw.js`
- `src/styles.css`

## Instalación

1. Copiar los archivos respetando exactamente sus rutas relativas.
2. Instalar dependencias con `npm ci`.
3. Verificar las variables de entorno existentes, especialmente `DATABASE_URL`.
4. Aplicar la migración incluida:

```bash
npm run db:migrate
```

5. Validar el proyecto:

```bash
npm run typecheck
npm run test
npm run build
```

6. Arrancar en desarrollo:

```bash
npm run dev
```

### Importante sobre Drizzle

La migración `0002_bloom_premium.sql` y su entrada en `_journal.json` están incluidos manualmente porque este entorno no pudo completar la instalación de `node_modules`. No se generó un snapshot 0002 nuevo.

Aplica primero la migración incluida con `npm run db:migrate`. Después, cuando trabajes normalmente con Drizzle, usa `npm run db:generate` para futuras modificaciones del esquema.

## Validación realizada en este entorno

- Los 69 archivos TypeScript/TSX de `src/` pasan el parser de TypeScript sin errores de sintaxis.
- Se comprobó que no hay imports locales inexistentes dentro de `src/`.
- No fue posible ejecutar `npm ci` debido a un timeout de acceso al registro/caché incompleto; por ese motivo no se afirma aquí que `typecheck`, `test` y `build` hayan sido ejecutados satisfactoriamente.

## Alcance deliberadamente preservado

- Se mantuvo `src/app/api/workout/route.ts` para compatibilidad con el flujo anterior.
- No se reescribieron las tablas existentes de moods, exercises o daily_logs.
- La Fase 5 (monetización/suscripción/paywall) no está incluida.
