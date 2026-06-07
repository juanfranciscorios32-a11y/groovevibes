# Prompt para continuar el proyecto en un chat nuevo

Copiá y pegá el siguiente bloque al iniciar una conversación nueva con Claude.
Al final, agregale qué querés trabajar en ese chat (la línea entre corchetes).

---

Soy Juanfra, dueño de Groovevibes — una agencia de artistas/DJs electrónicos en Argentina. Estoy construyendo un sistema de gestión web para administrar fechas, artistas, productoras y seguimiento de oportunidades. Vengo trabajando con Claude y necesito continuar el proyecto desde donde lo dejé. Acá va todo el contexto:

═══════════════════════════════════════════════════════════
QUÉ ES EL SISTEMA
═══════════════════════════════════════════════════════════

Una single-page application en HTML+Tailwind+vanilla JS para gestionar:
- Agenda de fechas de mis artistas (calendario)
- Seguimiento de oportunidades en pipeline (CRM-like con WhatsApp parser)
- Roster de artistas con fees y planner anual
- Base de datos de venues/productoras
- Checklists pre-evento (10 items) y post-evento (4 items) con cálculo de saldo

═══════════════════════════════════════════════════════════
ARCHIVO Y UBICACIÓN
═══════════════════════════════════════════════════════════

Archivo principal: groovevibes-dashboard.html (o index.html después de renombrar)
Ubicación: C:\Users\User\Documents\Claude\Projects\SISTEMA DE GESTION AGENCIA\

Es UN SOLO archivo HTML autocontenido (~2500 líneas) con:
- Tailwind CDN para estilos
- Vanilla JS sin frameworks ni build step
- localStorage para persistencia (state key: "groovevibes_state_v1")
- Datos pre-cargados (SEED) en el mismo archivo
- Sin dependencias externas excepto Tailwind CDN

═══════════════════════════════════════════════════════════
SECCIONES IMPLEMENTADAS (5 tabs)
═══════════════════════════════════════════════════════════

1. DASHBOARD — Stats, fechas urgentes (<7 días con checklist incompleto en rojo), próximas fechas, cierres post-evento pendientes. Saludo personalizado.

2. CALENDARIO — 66 fechas migradas del Excel original. Agrupadas por mes. Filtros por artista/estado/responsable/búsqueda. Marca urgentes en rojo.

3. SEGUIMIENTO — Reemplazó al "Pipeline". Tiene dos vistas: Feed (timeline tipo WhatsApp con avatares por encargado) y Tabla (vista clásica con filtros). Sidebar con "Retomar contacto" (oportunidades >14 días sin update).

   Modal de "Nueva actualización" con:
   - Parser de WhatsApp: pegás texto en formato libre y extrae artista, productora, ciudad, mes, prioridad, contacto. Heurísticas con regex.
   - Campos manuales: artista (dropdown roster), productora (autocomplete desde base de venues), ciudad, mes objetivo, contacto, estado, prioridad, encargado (Rama/Juanfra/EL DJ), comentario.
   - Botón "Enviar a WhatsApp" que abre wa.me con mensaje formateado.
   - Auto-crea oportunidad o suma update al hilo existente (matching por artista+productora).

4. ROSTER — 14 artistas con fees min/std/ideal, género, IG, contadores de fechas. Cada card tiene botón "📅 Ver plan anual" que abre el planner.

   PLANNER ANUAL (modal grande, grid de 12 meses):
   - Por artista, navegable entre años con flechas
   - Cada mes muestra fechas confirmadas/finalizadas del calendario en violeta (auto-pulled, no editables desde acá) + objetivos planificados con código de colores (amarillo=tentativo, azul=contactado, indigo=confirmado, verde=alcanzado)
   - Botón "+ Sumar objetivo" abre sub-modal con: mes, productora (autocomplete venues), ciudad, contacto, estado, prioridad, notas, y opción de vincular con oportunidad de pipeline existente.
   - Stats: objetivos, en proceso, alcanzados, fechas reales.

5. VENUES — ~110 venues/productoras con buscador, ciudad, tipo, contacto, IG.

═══════════════════════════════════════════════════════════
DATOS PRE-CARGADOS (en const SEED en el JS)
═══════════════════════════════════════════════════════════

- 14 artistas: Rafa Calello, Andres Koller, Jorge Savoretti, Juan (AR), Movedek, Adelina Sofia, Caro Meneghetti, Fer Furlan, Ian Fauvarque, Lautaro Gabioud, Felipe Reinheimer, Tomi Bisquierra, Max Blade, Emilia Ginovich. Con fees, género e IG donde aplica.

- 66 fechas: ene-ago 2026, con artista, ciudad, productora, promotor, estado (Finalizado/Confirmado/Por confirmar), oferta, seña, responsable, gastos de viaje, comentarios.

- ~50 oportunidades de pipeline: por artista, con productora, ciudad, mes objetivo, encargado, estado, prioridad, contacto, observaciones. Las observaciones se auto-convierten en el primer "update" del timeline.

- ~110 venues/productoras: con ciudad, tipo, instagram, contacto, géneros.

═══════════════════════════════════════════════════════════
ESTRUCTURA DE STATE (en localStorage)
═══════════════════════════════════════════════════════════

```js
state = {
  calendario: [{id, fecha, artista, ciudad, productora, promotor, estado,
                oferta, sena, responsable, gastosViaje, comentarios,
                logistica, checklistPre:{}, checklistPost:{}, gastos:0}],
  pipeline:   [{id, artista, productora, ciudad, mes, encargado, estado,
                prioridad, contacto, obs}],
  updates:    [{id, oppId, timestamp, encargado, contacto, comentario}],
  planner:    [{id, artista, year, month, productora, ciudad, contacto,
                prioridad, status, notas, oppId}],
  currentUser: "Juanfra"
}
```

═══════════════════════════════════════════════════════════
DECISIONES TÉCNICAS YA TOMADAS
═══════════════════════════════════════════════════════════

- Idioma: español (Argentina)
- Tono UX: clean, profesional, electrónico/music-vibe con gradient indigo-purple
- No usar emojis en exceso pero sí algunos íconos para warmth (📅 🎯 ✅ etc)
- Mobile-first responsive
- Sin build step (todo en un archivo, fácil de iterar)
- Tailwind CDN (clases dinámicas con template strings NO son detectadas — usar strings explícitos como hicimos con badges de estado/prioridad)
- localStorage por ahora, con migración pendiente a backend real

═══════════════════════════════════════════════════════════
ESTADO DEL DEPLOY
═══════════════════════════════════════════════════════════

Subido a Netlify (cuenta gratis con email juanfranciscorios32@gmail.com).
URL temporal: merry-souffle-08c8f7.netlify.app

PROBLEMA ACTUAL: el archivo se subió como groovevibes-dashboard.html en lugar de index.html, dando 404 al acceder a la raíz. El fix es renombrar el archivo local a "index.html" y re-deployarlo arrastrándolo a "Production deploys" en el dashboard de Netlify. También está pendiente cambiar el nombre del sitio de "merry-souffle-08c8f7" a algo como "groovevibes-agencia".

═══════════════════════════════════════════════════════════
LO QUE QUEDA PENDIENTE (próximos pasos)
═══════════════════════════════════════════════════════════

CORTO PLAZO:
1. Resolver el 404: renombrar local a index.html, re-deployar
2. Cambiar nombre del sitio Netlify a algo memorable

MEDIO PLAZO (lo más importante):
3. SINCRONIZACIÓN DE DATOS — actualmente cada navegador tiene su propia copia. Para que Juanfra + sus socios (Rama, EL DJ) vean lo mismo en tiempo real hay que migrar de localStorage a un backend. Las opciones que evaluamos:
   - Supabase (recomendada): DB cloud + auth + real-time, ~30 min setup
   - Google Sheets via Apps Script: mantiene el Sheet como source of truth
   - Notion/Airtable: alternativas con frontend listo

LARGO PLAZO:
4. WhatsApp Business API: hoy el parser de mensajes es manual (pegás texto). Integración real requiere cuenta WhatsApp Business + webhook + backend. Costos: USD 30-50/mes mínimo (Twilio/360dialog/Meta).
5. Notificaciones email cuando una fecha está a <7 días con checklist incompleto
6. Dominio propio (groovevibes.com)
7. Importar datos de "Jorge Savoretti - Promoter List Argentina" (Google Sheet pendiente, dio error de cuota cuando intentamos leer)

═══════════════════════════════════════════════════════════
FEATURES CLAVE QUE NO QUIERO QUE OLVIDES
═══════════════════════════════════════════════════════════

- El sistema lo usamos 3 personas: Juanfra (yo), Rama y EL DJ
- Las fechas pasan por checklist pre-evento (sí o sí completo a 7 días del show)
- Post-evento siempre cierra con: feedback del promotor, saldo, gastos, material
- El seguimiento de pipeline es lo más activo del sistema — actualizo todos los días con cómo van las negociaciones con promotores
- Quiero mantener el flujo simple para no abandonarlo

═══════════════════════════════════════════════════════════
ARRANCAR
═══════════════════════════════════════════════════════════

Lee el archivo groovevibes-dashboard.html (o index.html) en mi carpeta para ver el estado actual exacto del código antes de proponer cambios. Si algo no está claro o necesitás contexto adicional, preguntame.

Ahora quiero seguir con: [acá especificá qué necesitás en este chat nuevo]
