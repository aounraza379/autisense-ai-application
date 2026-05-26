import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

let db = null;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('autisense.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS child_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      communication_level TEXT DEFAULT 'mixed',
      preferred_role TEXT DEFAULT 'parent',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER,
      role TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      ended_at TEXT,
      FOREIGN KEY (child_id) REFERENCES child_profile(id)
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      child_id INTEGER,
      user_text TEXT,
      ai_response TEXT,
      detected_state TEXT,
      input_type TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      hour_of_day INTEGER,
      day_of_week INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER,
      task_name TEXT,
      completed_at TEXT DEFAULT (datetime('now')),
      day_of_week INTEGER,
      hour_of_day INTEGER,
      FOREIGN KEY (child_id) REFERENCES child_profile(id)
    );

    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER,
      category TEXT,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES child_profile(id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  return db;
}

// ── Child Profile ─────────────────────────────────────────

export async function createChildProfile(name, age, communicationLevel = 'mixed') {
  const result = await db.runAsync(
    'INSERT INTO child_profile (name, age, communication_level) VALUES (?, ?, ?)',
    [name, age, communicationLevel]
  );
  return result.lastInsertRowId;
}

export async function getChildProfile(childId) {
  return await db.getFirstAsync(
    'SELECT * FROM child_profile WHERE id = ?', [childId]
  );
}

export async function updatePreferredRole(childId, role) {
  await db.runAsync(
    'UPDATE child_profile SET preferred_role = ? WHERE id = ?', [role, childId]
  );
}

// ── Sessions ──────────────────────────────────────────────

export async function startSession(childId, role) {
  const result = await db.runAsync(
    'INSERT INTO sessions (child_id, role) VALUES (?, ?)', [childId, role]
  );
  return result.lastInsertRowId;
}

export async function endSession(sessionId) {
  await db.runAsync(
    "UPDATE sessions SET ended_at = datetime('now') WHERE id = ?", [sessionId]
  );
}

// ── Interactions ──────────────────────────────────────────

export async function logInteraction(sessionId, childId, userText, aiResponse, state, inputType) {
  const now = new Date();
  await db.runAsync(
    `INSERT INTO interactions
     (session_id, child_id, user_text, ai_response, detected_state, input_type, hour_of_day, day_of_week)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, childId, userText, aiResponse, state, inputType, now.getHours(), now.getDay()]
  );
}

// ── Task Completions ──────────────────────────────────────

export async function logTaskCompletion(childId, taskName) {
  const now = new Date();
  await db.runAsync(
    `INSERT INTO task_completions (child_id, task_name, day_of_week, hour_of_day)
     VALUES (?, ?, ?, ?)`,
    [childId, taskName, now.getDay(), now.getHours()]
  );
}

export async function getTaskHistory(childId, taskName) {
  return await db.getAllAsync(
    `SELECT * FROM task_completions
     WHERE child_id = ? AND task_name = ?
     ORDER BY completed_at DESC LIMIT 30`,
    [childId, taskName]
  );
}

// ── Preferences ───────────────────────────────────────────

export async function savePreference(childId, category, value) {
  const existing = await db.getFirstAsync(
    'SELECT id FROM preferences WHERE child_id = ? AND category = ?',
    [childId, category]
  );
  if (existing) {
    await db.runAsync(
      "UPDATE preferences SET value = ?, updated_at = datetime('now') WHERE id = ?",
      [value, existing.id]
    );
  } else {
    await db.runAsync(
      'INSERT INTO preferences (child_id, category, value) VALUES (?, ?, ?)',
      [childId, category, value]
    );
  }
}

export async function getPreferences(childId) {
  const rows = await db.getAllAsync(
    'SELECT category, value FROM preferences WHERE child_id = ?', [childId]
  );
  const prefs = {};
  rows.forEach(r => { prefs[r.category] = r.value; });
  return prefs;
}

// ── Analytics ─────────────────────────────────────────────

export async function getEmotionFrequency(childId, days = 7) {
  return await db.getAllAsync(
    `SELECT detected_state, COUNT(*) as count
     FROM interactions
     WHERE child_id = ?
       AND timestamp >= datetime('now', '-${days} days')
     GROUP BY detected_state
     ORDER BY count DESC`,
    [childId]
  );
}

export async function getRecentInteractions(childId, limit = 10, role = null) {
  if (role) {
    return await db.getAllAsync(
      `SELECT i.* FROM interactions i
       JOIN sessions s ON i.session_id = s.id
       WHERE i.child_id = ? AND s.role = ?
       ORDER BY i.timestamp DESC LIMIT ?`,
      [childId, role, limit]
    );
  } else {
    return await db.getAllAsync(
      `SELECT * FROM interactions
       WHERE child_id = ?
       ORDER BY timestamp DESC LIMIT ?`,
      [childId, limit]
    );
  }
}

export async function setSetting(key, value) {
  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, String(value)]
  );
}

export async function getSetting(key) {
  const row = await db.getFirstAsync(
    'SELECT value FROM app_settings WHERE key = ?', [key]
  );
  return row ? row.value : null;
}

export async function getSessionAnalytics(childId, days = 7) {
  return await db.getAllAsync(`
    SELECT 
      COUNT(*) as total_sessions,
      AVG((julianday(ended_at) - julianday(started_at)) * 24 * 60) as avg_duration_minutes,
      date(started_at) as session_date
    FROM sessions
    WHERE child_id = ? AND started_at >= datetime('now', '-${days} days') AND ended_at IS NOT NULL
    GROUP BY session_date
    ORDER BY session_date ASC
  `, [childId]);
}

export async function exportDataAsCSV(childId) {
  try {
    const interactions = await db.getAllAsync(
      'SELECT * FROM interactions WHERE child_id = ? ORDER BY timestamp DESC', [childId]
    );
    
    let csvString = 'id,session_id,user_text,ai_response,detected_state,timestamp\n';
    interactions.forEach(row => {
      const userText = (row.user_text || '').replace(/"/g, '""');
      const aiResponse = (row.ai_response || '').replace(/"/g, '""');
      csvString += `${row.id},${row.session_id},"${userText}","${aiResponse}",${row.detected_state},${row.timestamp}\n`;
    });

    const fileUri = FileSystem.documentDirectory + 'autisense_data.csv';
    await FileSystem.writeAsStringAsync(fileUri, csvString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Analytics Data',
        UTI: 'public.comma-separated-values-text'
      });
      return { success: true };
    } else {
      return { success: false, error: 'Sharing is not available on this device' };
    }
  } catch (error) {
    console.error("Export error:", error);
    return { success: false, error: error.message || 'Failed to export data' };
  }
}
