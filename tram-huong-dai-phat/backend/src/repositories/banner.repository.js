const pool = require("../config/db");

/** Lấy tất cả banner đang active, sắp xếp theo sort_order */
const getActiveBanners = async () => {
  const result = await pool.query(
    `SELECT id, title, description, image_url, sort_order
     FROM banners
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, created_at ASC`
  );
  return result.rows;
};

/** Lấy tất cả banner (cho admin quản lý) */
const getAllBanners = async () => {
  const result = await pool.query(
    `SELECT * FROM banners ORDER BY sort_order ASC, created_at ASC`
  );
  return result.rows;
};

/** Tạo banner mới */
const createBanner = async ({ title, description, image_url, sort_order }) => {
  const result = await pool.query(
    `INSERT INTO banners (title, description, image_url, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description || null, image_url, sort_order || 0]
  );
  return result.rows[0];
};

/** Cập nhật banner */
const updateBanner = async (id, { title, description, image_url, is_active, sort_order }) => {
  const result = await pool.query(
    `UPDATE banners
     SET title = $1, description = $2, image_url = $3,
         is_active = $4, sort_order = $5
     WHERE id = $6
     RETURNING *`,
    [title, description || null, image_url, is_active, sort_order || 0, id]
  );
  return result.rows[0] || null;
};

/** Xoá banner */
const deleteBanner = async (id) => {
  const result = await pool.query(
    `DELETE FROM banners WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
