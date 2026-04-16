const pool = require("../config/db");

const getAllProducts = async (filters = {}) => {
  const { search, category_id } = filters;

  let query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.stock,
      p.image_url,
      p.is_featured,
      p.status,
      p.created_at,
      c.id AS category_id,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;

  const values = [];

  if (search) {
    values.push(`%${search}%`);
    query += ` AND p.name ILIKE $${values.length}`;
  }

  if (category_id) {
    values.push(category_id);
    query += ` AND p.category_id = $${values.length}`;
  }

  query += ` ORDER BY p.id DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

const getProductById = async (id) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.stock,
      p.image_url,
      p.is_featured,
      p.status,
      p.created_at,
      c.id AS category_id,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getAllCategories = async () => {
  const query = `
    SELECT id, name, description, created_at
    FROM categories
    ORDER BY id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const createProduct = async ({
  category_id,
  name,
  slug,
  description,
  price,
  stock,
  image_url,
  is_featured,
  status,
}) => {
  let finalStatus = status || "active";

  if (Number(stock) <= 0) {
    finalStatus = "out_of_stock";
  }

  const query = `
    INSERT INTO products (
      category_id, name, slug, description, price, stock, image_url, is_featured, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    category_id || null,
    name,
    slug || null,
    description || null,
    price,
    stock || 0,
    image_url || null,
    is_featured || false,
    finalStatus,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateProduct = async (
  id,
  {
    category_id,
    name,
    slug,
    description,
    price,
    stock,
    image_url,
    is_featured,
    status,
  }
) => {
  let finalStatus = status || "active";

  if (Number(stock) <= 0) {
    finalStatus = "out_of_stock";
  }

  const query = `
    UPDATE products
    SET
      category_id = $1,
      name = $2,
      slug = $3,
      description = $4,
      price = $5,
      stock = $6,
      image_url = $7,
      is_featured = $8,
      status = $9
    WHERE id = $10
    RETURNING *
  `;

  const values = [
    category_id || null,
    name,
    slug || null,
    description || null,
    price,
    stock || 0,
    image_url || null,
    is_featured || false,
    finalStatus,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllProducts,
  getProductById,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};