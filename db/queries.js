const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function fetchMessagesDesc() {
  const { rows } = await pool.query(
    'SELECT title, message, id FROM messages ORDER BY timestamp DESC'
  );
  return rows;
}

async function fetchMemberMessagesDesc() {
  const { rows } = await pool.query(
    'SELECT title, message, username, timestamp, messages.id FROM messages LEFT JOIN users ON messages.user_id = users.id ORDER BY timestamp DESC'
  );
  return rows;
}

async function fetchUsersAdmin() {
  const { rows } = await pool.query(
    'SELECT id, username, first, last, is_member, is_admin FROM users ORDER BY users.id'
  );
  return rows;
}

async function fetchMessagesAdmin() {
  const { rows } = await pool.query(
    'SELECT * FROM messages ORDER BY messages.id'
  );
  return rows;
}

async function registerNewUser(first, last, username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (first, last, username, password, is_member) VALUES ($1, $2, $3, $4, DEFAULT) ON CONFLICT (username) DO NOTHING RETURNING *',
    [first, last, username, hashedPassword]
  );
  return rows;
}

async function updateMemberStatus(bool, userId) {
  const { rows } = await pool.query(
    'UPDATE users SET is_member = $1 WHERE id = $2 RETURNING *',
    [bool, userId]
  );
  return rows[0];
}

async function updateAdminStatus(bool, userId) {
  const { rows } = await pool.query(
    'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING *',
    [bool, userId]
  );
  return rows[0];
}

async function insertNewMessage(title, message, userId) {
  await pool.query(
    'INSERT INTO messages (title, message, user_id) VALUES ($1, $2, $3)',
    [title, message, userId]
  );
}

async function deleteMessage(messageId) {
  const { rowCount } = await pool.query(
    'DELETE FROM messages WHERE messages.id = $1 RETURNING *',
    [messageId]
  );
  return rowCount;
}

module.exports = {
  fetchMessagesDesc,
  fetchMemberMessagesDesc,
  fetchUsersAdmin,
  fetchMessagesAdmin,
  registerNewUser,
  updateMemberStatus,
  updateAdminStatus,
  insertNewMessage,
  deleteMessage,
};
