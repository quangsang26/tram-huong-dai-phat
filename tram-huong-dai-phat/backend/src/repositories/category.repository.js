const pool = require("../config/db");

const getAllCategories = async () => {
  const result = await pool.query(
    `SELECT id, name, description, image_url, created_at
     FROM categories
     ORDER BY id ASC`
  );
  return result.rows;
};

const createCategory = async ({ name, description, image_url }) => {
  const result = await pool.query(
    `INSERT INTO categories (name, description, image_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description || null, image_url || null]
  );
  return result.rows[0];
};

const updateCategory = async (id, { name, description, image_url }) => {
  const result = await pool.query(
    `UPDATE categories
     SET name = $1, description = $2, image_url = $3
     WHERE id = $4
     RETURNING *`,
    [name, description || null, image_url || null, id]
  );
  return result.rows[0];
};

const deleteCategory = async (id) => {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};