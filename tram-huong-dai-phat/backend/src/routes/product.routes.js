const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductDetail);
router.get("/categories", productController.getCategories);

router.post("/admin/products", verifyToken, requireAdmin, productController.createProduct);
router.put("/admin/products/:id", verifyToken, requireAdmin, productController.updateProduct);
router.delete("/admin/products/:id", verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;