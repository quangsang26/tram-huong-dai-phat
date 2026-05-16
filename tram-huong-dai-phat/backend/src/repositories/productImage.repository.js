const pool = require("../config/db");

/** Lấy tất cả ảnh của 1 sản phẩm */
const getImagesByProductId = async (productId) => {
  const result = await pool.query(
    `SELECT id, image_url, sort_order
     FROM product_images
     WHERE product_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
  return result.rows;
};

/** Thêm ảnh mới cho sản phẩm */
const addProductImage = async (productId, imageUrl, sortOrder = 0) => {
  const result = await pool.query(
    `INSERT INTO product_images (product_id, image_url, sort_order)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [productId, imageUrl, sortOrder]
  );
  return result.rows[0];
};

/** Xoá 1 ảnh theo id */
const deleteProductImage = async (imageId) => {
  const result = await pool.query(
    `DELETE FROM product_images WHERE id = $1 RETURNING *`,
    [imageId]
  );
  return result.rows[0] || null;
};

/** Xoá tất cả ảnh của 1 sản phẩm */
const deleteAllProductImages = async (productId) => {
  await pool.query(
    `DELETE FROM product_images WHERE product_id = $1`,
    [productId]
  );
};

module.exports = {
  getImagesByProductId,
  addProductImage,
  deleteProductImage,
  deleteAllProductImages,
};
