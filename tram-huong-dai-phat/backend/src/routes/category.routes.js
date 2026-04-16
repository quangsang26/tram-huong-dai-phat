const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/categories", categoryController.getCategories);

router.post("/admin/categories", verifyToken, requireAdmin, categoryController.createCategory);
router.put("/admin/categories/:id", verifyToken, requireAdmin, categoryController.updateCategory);
router.delete("/admin/categories/:id", verifyToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;