const pool = require("../config/db");

const getAllUsers = async () => {
  const query = `
    SELECT id, full_name, email, phone, address, role, created_at
    FROM users
    ORDER BY id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

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

const getOrdersByUserId = async (userId) => {
  const query = `
    SELECT 
      id,
      customer_name,
      phone,
      address,
      total_amount,
      payment_method,
      payment_status,
      order_status,
      created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY id DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  getAllUsers,
  getUserById,
  getOrdersByUserId,
};