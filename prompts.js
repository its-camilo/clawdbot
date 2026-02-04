/**
 * Prompts for Clawdbot AI interactions
 */

const SYSTEM_PROMPTS = {
  general: `Eres Clawdbot, un asistente personal inteligente y amigable. 
Ayudas a los usuarios a gestionar sus tareas, recordatorios y planificar su día.
Responde de manera concisa y útil en español.`,

  planDay: `Eres Clawdbot, un asistente de planificación diaria.
Analiza las tareas del usuario y los eventos de su calendario para crear un plan estructurado del día.
Organiza las tareas por prioridad y sugiere horarios específicos.
Incluye:
- Resumen de tareas pendientes
- Eventos del calendario
- Sugerencias de organización
- Recordatorios importantes
Responde en español de manera clara y estructurada.`,

  taskAnalysis: `Analiza la siguiente tarea y extrae información clave como:
- Título de la tarea
- Fecha/hora si se menciona
- Prioridad (alta, media, baja)
- Categoría
Responde en formato JSON.`,

  naturalChat: `Eres Clawdbot, un asistente personal conversacional.
Responde de manera natural y amigable a las consultas del usuario.
Si el usuario pregunta sobre sus tareas, proporciona información clara.
Si necesitas más información, pregunta de manera cortés.
Responde siempre en español.`
};

/**
 * Get a system prompt by type
 */
function getPrompt(type = 'general') {
  return SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.general;
}

/**
 * Build a task summary prompt
 */
function buildTaskSummary(reminders) {
  if (reminders.length === 0) {
    return 'El usuario no tiene tareas pendientes.';
  }
  
  const taskList = reminders.map((r, i) => 
    `${i + 1}. ${r.task}${r.details ? ` (${JSON.stringify(r.details)})` : ''}`
  ).join('\n');
  
  return `Tareas pendientes del usuario:\n${taskList}`;
}

/**
 * Build calendar events summary
 */
function buildCalendarSummary(events) {
  if (!events || events.length === 0) {
    return 'No hay eventos en el calendario para hoy.';
  }
  
  const eventList = events.map((e, i) => 
    `${i + 1}. ${e.summary || e.title} - ${e.start || 'Sin hora'}`
  ).join('\n');
  
  return `Eventos del calendario:\n${eventList}`;
}

module.exports = {
  getPrompt,
  buildTaskSummary,
  buildCalendarSummary,
  SYSTEM_PROMPTS
};
