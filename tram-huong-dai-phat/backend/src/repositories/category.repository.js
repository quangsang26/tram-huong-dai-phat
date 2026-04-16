const pool = require("../config/db");

const getAllCategories = async () => {
  const query = `
    SELECT id, name, description, created_at
    FROM categories
    ORDER BY id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const createCategory = async ({ name, description }) => {
  const query = `
    INSERT INTO categories (name, description)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await pool.query(query, [name, description || null]);
  return result.rows[0];
};

const updateCategory = async (id, { name, description }) => {
  const query = `
    UPDATE categories
    SET name = $1,
        description = $2
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [name, description || null, id]);
  return result.rows[0];
};

const deleteCategory = async (id) => {
  const query = `
    DELETE FROM categories
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};