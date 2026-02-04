const TelegramBot = require('node-telegram-bot-api');
const { getAllReminders, addReminder, deleteReminder, getPendingDeletions } = require('./reminders');
const { chat, generateDailyPlan } = require('./clawdbot');
const { getPrompt } = require('./prompts');
const { getTodayEvents, getImportantEmails } = require('./google');
const { getTodayEventsCalDAV } = require('./caldav');

let bot = null;

/**
 * Initialize Telegram bot
 */
function initializeTelegram(token) {
  if (!token) {
    console.log('Telegram bot not configured - skipping initialization');
    return false;
  }
  
  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('Telegram bot initialized successfully');
    
    setupCommands();
    setupMessageHandler();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error.message);
    return false;
  }
}

/**
 * Setup bot commands
 */
function setupCommands() {
  if (!bot) return;
  
  // Command: /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      '¡Hola! Soy Clawdbot 🤖\n\n' +
      'Comandos disponibles:\n' +
      '/mi_dia - Ver el plan del día con tareas y calendario\n' +
      '/tareas - Ver todas tus tareas\n' +
      '/agregar [tarea] - Agregar una nueva tarea\n' +
      '/delete_confirm [id] - Eliminar una tarea\n' +
      '/ayuda - Ver esta ayuda\n\n' +
      'También puedes chatear conmigo naturalmente!'
    );
  });
  
  // Command: /ayuda
  bot.onText(/\/ayuda/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
      'Comandos de Clawdbot:\n\n' +
      '/start - Iniciar el bot\n' +
      '/mi_dia - Plan del día completo\n' +
      '/tareas - Listar todas las tareas\n' +
      '/agregar [tarea] - Agregar tarea\n' +
      '/delete_confirm [id] - Eliminar tarea por ID\n' +
      '/pendientes - Ver tareas pendientes de eliminar\n' +
      '/ayuda - Mostrar esta ayuda'
    );
  });
  
  // Command: /mi_dia
  bot.onText(/\/mi_dia/, async (msg) => {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(chatId, '⏳ Generando tu plan del día...');
    
    try {
      // Get reminders
      const reminders = getAllReminders();
      
      // Get calendar events (Google + CalDAV)
      const googleEvents = await getTodayEvents();
      const calDAVEvents = await getTodayEventsCalDAV();
      const allEvents = [
        ...(googleEvents.events || []),
        ...(calDAVEvents.events || [])
      ];
      
      // Get emails (optional)
      let emailSummary = null;
      try {
        const emails = await getImportantEmails(3);
        if (emails.success && emails.emails.length > 0) {
          emailSummary = emails.emails.map(e => `- ${e.subject} (de: ${e.from})`).join('\n');
        }
      } catch (e) {
        console.log('Could not fetch emails:', e.message);
      }
      
      // Generate plan with AI
      const plan = await generateDailyPlan(reminders, allEvents, emailSummary);
      
      if (plan.success) {
        await bot.sendMessage(chatId, `📅 *Tu Plan del Día*\n\n${plan.response}`, { parse_mode: 'Markdown' });
      } else {
        await bot.sendMessage(chatId, `❌ Error al generar el plan: ${plan.message}`);
      }
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  });
  
  // Command: /tareas
  bot.onText(/\/tareas/, (msg) => {
    const chatId = msg.chat.id;
    const reminders = getAllReminders();
    
    if (reminders.length === 0) {
      bot.sendMessage(chatId, '✅ No tienes tareas pendientes.');
      return;
    }
    
    const taskList = reminders.map(r => 
      `${r.id}. ${r.task}${r.pending_delete ? ' ⚠️ (pendiente eliminar)' : ''}`
    ).join('\n');
    
    bot.sendMessage(chatId, `📋 *Tus Tareas:*\n\n${taskList}`, { parse_mode: 'Markdown' });
  });
  
  // Command: /agregar
  bot.onText(/\/agregar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const task = match[1];
    
    const reminder = addReminder(task);
    bot.sendMessage(chatId, `✅ Tarea agregada:\n${reminder.id}. ${reminder.task}`);
  });
  
  // Command: /delete_confirm
  bot.onText(/\/delete_confirm (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1];
    
    const result = deleteReminder(id, true);
    
    if (result.success) {
      bot.sendMessage(chatId, `✅ ${result.message}\nTarea: ${result.reminder.task}`);
    } else {
      bot.sendMessage(chatId, `❌ ${result.message}`);
    }
  });
  
  // Command: /pendientes
  bot.onText(/\/pendientes/, (msg) => {
    const chatId = msg.chat.id;
    const pending = getPendingDeletions();
    
    if (pending.length === 0) {
      bot.sendMessage(chatId, 'No hay tareas pendientes de eliminar.');
      return;
    }
    
    const taskList = pending.map(r => `${r.id}. ${r.task}`).join('\n');
    bot.sendMessage(chatId, 
      `⚠️ *Tareas pendientes de eliminar:*\n\n${taskList}\n\n` +
      'Usa /delete_confirm [id] para confirmar.',
      { parse_mode: 'Markdown' }
    );
  });
}

/**
 * Setup natural language message handler
 */
function setupMessageHandler() {
  if (!bot) return;
  
  bot.on('message', async (msg) => {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) {
      return;
    }
    
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    
    if (!userMessage) return;
    
    try {
      // Check if user wants to add a task
      if (userMessage.toLowerCase().includes('agregar') || 
          userMessage.toLowerCase().includes('recordar')) {
        
        // Extract the task from the message (remove the command words)
        let taskText = userMessage
          .replace(/agregar/gi, '')
          .replace(/recordar/gi, '')
          .replace(/que\s+/gi, '')
          .replace(/debo\s+/gi, '')
          .trim();
        
        if (!taskText) {
          taskText = userMessage; // Fall back to full message if extraction fails
        }
        
        const reminder = addReminder(taskText);
        await bot.sendMessage(chatId, `✅ Tarea agregada: ${reminder.task}`);
        return;
      }
      
      // Check if user wants to see tasks
      if (userMessage.toLowerCase().includes('tareas') ||
          userMessage.toLowerCase().includes('pendiente')) {
        
        const reminders = getAllReminders();
        if (reminders.length === 0) {
          await bot.sendMessage(chatId, 'No tienes tareas pendientes.');
        } else {
          const taskList = reminders.map(r => `${r.id}. ${r.task}`).join('\n');
          await bot.sendMessage(chatId, `Tus tareas:\n\n${taskList}`);
        }
        return;
      }
      
      // Natural conversation with AI
      const reminders = getAllReminders();
      const context = reminders.length > 0 
        ? `\n\nTareas del usuario:\n${reminders.map(r => `- ${r.task}`).join('\n')}`
        : '';
      
      const result = await chat(
        userMessage + context,
        getPrompt('naturalChat')
      );
      
      if (result.success) {
        await bot.sendMessage(chatId, result.response);
      } else {
        await bot.sendMessage(chatId, 'Lo siento, no pude procesar tu mensaje.');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await bot.sendMessage(chatId, 'Ocurrió un error al procesar tu mensaje.');
    }
  });
}

/**
 * Send message via bot (for external triggers)
 */
async function sendMessage(chatId, message) {
  if (!bot) {
    return { success: false, message: 'Telegram bot not configured' };
  }
  
  try {
    await bot.sendMessage(chatId, message);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  initializeTelegram,
  sendMessage
};
