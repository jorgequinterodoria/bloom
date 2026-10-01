# Bloom — Fase 5 (gratuita, sin suscripción)

La Fase 5 completa la experiencia premium de producto sin introducir monetización, paywalls, planes ni dependencias de IA de pago.

## Incluido

### Bloom Coach
- Nueva ruta `/coach`.
- Coach local basado en reglas y en el contexto real del usuario.
- Respuestas para estrés/ansiedad, energía/motivación, movimiento y progreso.
- Historial persistente de conversación en PostgreSQL.
- Recomendación diaria contextual.

### Insights avanzados
- Impacto promedio de las sesiones antes/después.
- Sesiones que mejoraron al menos una señal.
- Vista 7/30/90 días existente de Fases 1–4.
- Resumen de uso de Bloom: sesiones, Coach y paisajes sonoros.

### Bloom Soundscapes
- Lluvia, mar, bosque y noche generados con Web Audio API.
- Sin archivos de audio externos ni CDN.
- Volumen configurable.
- Detención automática al salir de la página.

### Analítica propia
- `wellness_events` con eventos mínimos y vinculados al usuario.
- Eventos de check-in, recomendación, sesión, Coach, jardín, evolución y paisajes sonoros.
- `GET /api/analytics` devuelve únicamente las métricas del usuario autenticado.
- No hay Google Analytics, Mixpanel, Amplitude ni otros terceros.

### Persistencia
Nueva migración:

`drizzle/0003_bloom_coach_free.sql`

Tablas:

- `coach_messages`
- `wellness_events`

## Sin monetización

Todas las capacidades de Bloom permanecen disponibles para el usuario. No se añadieron:

- suscripciones;
- compras dentro de la app;
- paywalls;
- límites artificiales por plan;
- lógica de Premium/Free;
- claves de API de modelos externos.

## Validación realizada

- Transpilación TS/TSX de todo `src`: sin errores sintácticos en 77 archivos (`.d.ts` excluidos de la transpilación ejecutable).
- Imports locales `@/...`: 0 referencias inexistentes.
- Typecheck aislado de `src/lib/coach.ts`: OK.
- Typecheck aislado de `src/lib/soundscapes.ts`: OK.
- Pruebas de lógica del Coach: 3/3 OK.

`npm ci` no pudo completar en el entorno de generación por timeout de transporte, por lo que no se afirma un `npm test` o `next build` ejecutado en este entorno.

## Instalación

1. Aplicar la migración con Drizzle:

```bash
npm run db:migrate
```

2. Ejecutar validaciones locales:

```bash
npm run typecheck
npm test
npm run build
```
