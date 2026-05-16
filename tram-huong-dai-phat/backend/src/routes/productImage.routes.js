const express = require("express");
const router = express.Router();
const productImageController = require("../controllers/productImage.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// Public — trang chi tiết sản phẩm lấy ảnh
router.get("/products/:productId/images", productImageController.getProductImages);

// Admin — thêm / xoá ảnh
router.post(
  "/admin/products/:productId/images",
  verifyToken,
  requireAdmin,
  productImageController.addProductImage
);

router.delete(
  "/admin/product-images/:imageId",
  verifyToken,
  requireAdmin,
  productImageController.deleteProductImage
);

module.exports = router;
