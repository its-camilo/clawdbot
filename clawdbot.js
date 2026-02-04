const Groq = require('groq-sdk');

let groqClient = null;

/**
 * Initialize Groq client
 */
function initializeGroq(apiKey) {
  if (!apiKey) {
    console.warn('Warning: GROQ_API_KEY not provided. AI features will be disabled.');
    return false;
  }
  
  try {
    groqClient = new Groq({ apiKey });
    console.log('Groq client initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Groq client:', error.message);
    return false;
  }
}

/**
 * Chat with Clawdbot using Groq
 */
async function chat(messages, systemPrompt = null) {
  if (!groqClient) {
    return {
      success: false,
      message: 'AI not available - GROQ_API_KEY not configured'
    };
  }
  
  try {
    const messageArray = Array.isArray(messages) ? messages : [
      { role: 'user', content: messages }
    ];
    
    if (systemPrompt) {
      messageArray.unshift({ role: 'system', content: systemPrompt });
    }
    
    const completion = await groqClient.chat.completions.create({
      messages: messageArray,
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    const response = completion.choices[0]?.message?.content || 'No response';
    
    return {
      success: true,
      response,
      usage: completion.usage
    };
  } catch (error) {
    console.error('Groq API error:', error.message);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Generate a daily plan
 */
async function generateDailyPlan(reminders, calendarEvents, emailSummary = null) {
  if (!groqClient) {
    return {
      success: false,
      message: 'AI not available - GROQ_API_KEY not configured'
    };
  }
  
  const { getPrompt, buildTaskSummary, buildCalendarSummary } = require('./prompts');
  
  const taskSummary = buildTaskSummary(reminders);
  const calendarSummary = buildCalendarSummary(calendarEvents);
  const emailInfo = emailSummary ? `\n\nResumen de emails importantes:\n${emailSummary}` : '';
  
  const userMessage = `
${taskSummary}

${calendarSummary}${emailInfo}

Por favor, crea un plan estructurado para el día de hoy, priorizando las tareas y coordinando con los eventos del calendario.
`;
  
  return await chat(userMessage, getPrompt('planDay'));
}

/**
 * Process natural language to extract task information
 */
async function extractTaskInfo(userInput) {
  if (!groqClient) {
    return {
      success: false,
      message: 'AI not available - GROQ_API_KEY not configured'
    };
  }
  
  const { getPrompt } = require('./prompts');
  
  const result = await chat(
    `Extrae información de esta tarea: "${userInput}". Responde SOLO con JSON válido con las propiedades: task (string), priority (string: alta/media/baja), category (string opcional).`,
    getPrompt('taskAnalysis')
  );
  
  if (result.success) {
    try {
      // Try to parse JSON from the response
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, data: parsed };
      }
    } catch (e) {
      console.error('Failed to parse task info:', e.message);
    }
  }
  
  return result;
}

module.exports = {
  initializeGroq,
  chat,
  generateDailyPlan,
  extractTaskInfo
};
