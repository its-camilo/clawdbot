// In-memory storage for reminders
// Note: This is a simple in-memory store, not thread-safe for concurrent access
let reminders = [];
let reminderIdCounter = 1;

/**
 * Get all reminders
 */
function getAllReminders() {
  return reminders;
}

/**
 * Add a new reminder
 */
function addReminder(task, details = {}) {
  const reminder = {
    id: reminderIdCounter++,
    task,
    details,
    createdAt: new Date().toISOString(),
    pending_delete: false
  };
  reminders.push(reminder);
  return reminder;
}

/**
 * Mark a reminder for deletion (requires confirmation)
 */
function markForDeletion(id) {
  const reminder = reminders.find(r => r.id === parseInt(id));
  if (reminder) {
    reminder.pending_delete = true;
    return reminder;
  }
  return null;
}

/**
 * Delete a reminder (with confirmation check)
 */
function deleteReminder(id, confirm = false) {
  const reminder = reminders.find(r => r.id === parseInt(id));
  
  if (!reminder) {
    return { success: false, message: 'Reminder not found' };
  }
  
  if (!confirm) {
    markForDeletion(id);
    return { 
      success: false, 
      message: 'Deletion requires confirmation. Please confirm with confirm:true',
      reminder 
    };
  }
  
  reminders = reminders.filter(r => r.id !== parseInt(id));
  return { success: true, message: 'Reminder deleted successfully', reminder };
}

/**
 * Get reminders pending deletion
 */
function getPendingDeletions() {
  return reminders.filter(r => r.pending_delete);
}

/**
 * Clear all reminders
 */
function clearAllReminders() {
  reminders = [];
  reminderIdCounter = 1;
}

module.exports = {
  getAllReminders,
  addReminder,
  deleteReminder,
  markForDeletion,
  getPendingDeletions,
  clearAllReminders
};
