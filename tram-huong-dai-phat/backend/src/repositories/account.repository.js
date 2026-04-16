const pool = require("../config/db");

const getUserById = async (id) => {
  const query = `
    SELECT id, full_name, email, phone, address, role, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getUserWithPasswordById = async (id) => {
  const query = `
    SELECT id, full_name, email, password, phone, address, role, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateUserProfile = async (id, { full_name, phone, address }) => {
  const query = `
    UPDATE users
    SET
      full_name = $1,
      phone = $2,
      address = $3
    WHERE id = $4
    RETURNING id, full_name, email, phone, address, role, created_at
  `;
  const result = await pool.query(query, [
    full_name,
    phone || null,
    address || null,
    id,
  ]);
  return result.rows[0];
};

const updateUserPassword = async (id, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = $1
    WHERE id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [hashedPassword, id]);
  return result.rows[0];
};

module.exports = {
  getUserById,
  getUserWithPasswordById,
  updateUserProfile,
  updateUserPassword,
};