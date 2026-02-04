const { google } = require('googleapis');

let oauth2Client = null;
let calendar = null;
let gmail = null;

/**
 * Initialize Google APIs
 */
function initializeGoogle(clientId, clientSecret, refreshToken) {
  if (!clientId || !clientSecret || !refreshToken) {
    console.log('Google Calendar/Gmail not configured - skipping initialization');
    return false;
  }
  
  try {
    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    console.log('Google APIs initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Google APIs:', error.message);
    return false;
  }
}

/**
 * Get today's calendar events
 */
async function getTodayEvents() {
  if (!calendar) {
    return { success: false, message: 'Google Calendar not configured', events: [] };
  }
  
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    
    return {
      success: true,
      events: events.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        description: event.description,
        location: event.location
      }))
    };
  } catch (error) {
    console.error('Error fetching calendar events:', error.message);
    return { success: false, message: error.message, events: [] };
  }
}

/**
 * Get recent important emails (simplified)
 */
async function getImportantEmails(maxResults = 5) {
  if (!gmail) {
    return { success: false, message: 'Gmail not configured', emails: [] };
  }
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread is:important'
    });
    
    const messages = response.data.messages || [];
    const emails = [];
    
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date']
      });
      
      const headers = msg.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown sender';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      
      emails.push({ subject, from, date, id: message.id });
    }
    
    return { success: true, emails };
  } catch (error) {
    console.error('Error fetching emails:', error.message);
    return { success: false, message: error.message, emails: [] };
  }
}

/**
 * Create a calendar event
 */
async function createCalendarEvent(summary, startTime, endTime, description = '') {
  if (!calendar) {
    return { success: false, message: 'Google Calendar not configured' };
  }
  
  try {
    // Use timezone from environment or default to Mexico City
    const timeZone = process.env.TIMEZONE || 'America/Mexico_City';
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone,
      },
      end: {
        dateTime: endTime,
        timeZone,
      },
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    
    return { success: true, event: response.data };
  } catch (error) {
    console.error('Error creating calendar event:', error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  initializeGoogle,
  getTodayEvents,
  getImportantEmails,
  createCalendarEvent
};
