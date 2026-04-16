const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const createUser = async ({ full_name, email, password, phone, address }) => {
  const query = `
    INSERT INTO users (full_name, email, password, phone, address, role)
    VALUES ($1, $2, $3, $4, $5, 'customer')
    RETURNING id, full_name, email, phone, address, role, created_at
  `;
  const values = [full_name, email, password, phone, address];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
};