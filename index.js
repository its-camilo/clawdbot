require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Import modules
const { initializeGroq, chat, generateDailyPlan, extractTaskInfo } = require('./clawdbot');
const { getAllReminders, addReminder, deleteReminder, getPendingDeletions } = require('./reminders');
const { getPrompt, buildTaskSummary, buildCalendarSummary } = require('./prompts');
const { initializeGoogle, getTodayEvents, getImportantEmails } = require('./google');
const { initializeCalDAV, getTodayEventsCalDAV } = require('./caldav');
const { initializeTelegram, sendMessage } = require('./telegram');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration from environment variables
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

// Google configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// CalDAV configuration
const CALDAV_URL = process.env.CALDAV_URL;
const CALDAV_USERNAME = process.env.CALDAV_USERNAME;
const CALDAV_PASSWORD = process.env.CALDAV_PASSWORD;

// Initialize services
console.log('Initializing Clawdbot services...');
initializeGroq(GROQ_API_KEY);
initializeGoogle(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN);
initializeCalDAV(CALDAV_URL, CALDAV_USERNAME, CALDAV_PASSWORD);
initializeTelegram(TELEGRAM_TOKEN);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Clawdbot API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'POST /reminder': 'Add a new task/reminder',
      'POST /delete': 'Delete a task (requires confirm:true)',
      'POST /plan-dia': 'Generate daily plan with tasks and calendar',
      'POST /telegram': 'Natural chat and commands',
      'GET /reminders': 'Get all reminders'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * POST /reminder - Add a new task/reminder
 * Body: { task: string, details?: object }
 */
app.post('/reminder', async (req, res) => {
  try {
    const { task, details } = req.body;
    
    if (!task) {
      return res.status(400).json({ 
        success: false, 
        message: 'Task is required' 
      });
    }
    
    // Optionally use AI to extract task information
    let taskDetails = details || {};
    if (GROQ_API_KEY) {
      const aiResult = await extractTaskInfo(task);
      if (aiResult.success && aiResult.data) {
        taskDetails = { ...taskDetails, ...aiResult.data };
      }
    }
    
    const reminder = addReminder(task, taskDetails);
    
    res.json({
      success: true,
      message: 'Reminder added successfully',
      reminder
    });
  } catch (error) {
    console.error('Error in /reminder:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /delete - Delete a task
 * Body: { id: number, confirm: boolean }
 */
app.post('/delete', (req, res) => {
  try {
    const { id, confirm } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }
    
    const result = deleteReminder(id, confirm === true);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(confirm ? 404 : 400).json(result);
    }
  } catch (error) {
    console.error('Error in /delete:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /plan-dia - Generate daily plan
 * Body: { include_email?: boolean, chat_id?: string }
 */
app.post('/plan-dia', async (req, res) => {
  try {
    const { include_email, chat_id } = req.body;
    
    // Get all reminders
    const reminders = getAllReminders();
    
    // Get calendar events from Google
    const googleEvents = await getTodayEvents();
    
    // Get calendar events from CalDAV (Apple)
    const calDAVEvents = await getTodayEventsCalDAV();
    
    // Combine events
    const allEvents = [
      ...(googleEvents.events || []),
      ...(calDAVEvents.events || [])
    ];
    
    // Get emails if requested
    let emailSummary = null;
    if (include_email) {
      try {
        const emails = await getImportantEmails(5);
        if (emails.success && emails.emails.length > 0) {
          emailSummary = emails.emails.map(e => 
            `- ${e.subject} (de: ${e.from})`
          ).join('\n');
        }
      } catch (e) {
        console.log('Could not fetch emails:', e.message);
      }
    }
    
    // Generate daily plan with AI
    const plan = await generateDailyPlan(reminders, allEvents, emailSummary);
    
    // If chat_id is provided, also send to Telegram
    if (chat_id && plan.success) {
      await sendMessage(chat_id, `📅 *Tu Plan del Día*\n\n${plan.response}`);
    }
    
    res.json({
      success: plan.success,
      plan: plan.response || plan.message,
      reminders,
      events: allEvents,
      emails: emailSummary
    });
  } catch (error) {
    console.error('Error in /plan-dia:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /telegram - Natural chat and commands
 * Body: { message: string, chat_id?: string, command?: string }
 */
app.post('/telegram', async (req, res) => {
  try {
    const { message, chat_id, command } = req.body;
    
    if (!message && !command) {
      return res.status(400).json({
        success: false,
        message: 'Message or command is required'
      });
    }
    
    // Handle specific commands
    if (command === '/mi_dia') {
      const reminders = getAllReminders();
      const googleEvents = await getTodayEvents();
      const calDAVEvents = await getTodayEventsCalDAV();
      const allEvents = [
        ...(googleEvents.events || []),
        ...(calDAVEvents.events || [])
      ];
      
      const plan = await generateDailyPlan(reminders, allEvents);
      
      if (chat_id) {
        await sendMessage(chat_id, `📅 *Tu Plan del Día*\n\n${plan.response}`);
      }
      
      return res.json({
        success: true,
        response: plan.response || plan.message,
        command: '/mi_dia'
      });
    }
    
    if (command === '/delete_confirm') {
      // Extract ID from message, expecting format like "/delete_confirm 1" or just "1"
      const idMatch = message.match(/\b(\d+)\b/);
      if (!idMatch) {
        return res.status(400).json({
          success: false,
          message: 'Task ID not found in message. Use format: /delete_confirm [id]'
        });
      }
      
      const result = deleteReminder(idMatch[1], true);
      
      if (chat_id) {
        const msg = result.success 
          ? `✅ ${result.message}`
          : `❌ ${result.message}`;
        await sendMessage(chat_id, msg);
      }
      
      return res.json(result);
    }
    
    // Natural language chat
    const reminders = getAllReminders();
    const context = reminders.length > 0
      ? `\n\nTareas del usuario:\n${reminders.map(r => `- ${r.task}`).join('\n')}`
      : '';
    
    const result = await chat(
      message + context,
      getPrompt('naturalChat')
    );
    
    if (chat_id && result.success) {
      await sendMessage(chat_id, result.response);
    }
    
    res.json({
      success: result.success,
      response: result.response || result.message
    });
  } catch (error) {
    console.error('Error in /telegram:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /reminders - Get all reminders
 */
app.get('/reminders', (req, res) => {
  const reminders = getAllReminders();
  res.json({
    success: true,
    count: reminders.length,
    reminders
  });
});

/**
 * GET /pending-deletions - Get pending deletions
 */
app.get('/pending-deletions', (req, res) => {
  const pending = getPendingDeletions();
  res.json({
    success: true,
    count: pending.length,
    reminders: pending
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🤖 Clawdbot is running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST /reminder - Add a new task`);
  console.log(`  POST /delete - Delete a task`);
  console.log(`  POST /plan-dia - Generate daily plan`);
  console.log(`  POST /telegram - Natural chat and commands`);
  console.log(`  GET  /reminders - Get all reminders`);
  console.log(`\n✨ Ready to assist!\n`);
});

module.exports = app;
