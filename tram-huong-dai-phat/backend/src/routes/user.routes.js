const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/admin/users", verifyToken, requireAdmin, userController.getAllUsers);
router.get("/admin/users/:id", verifyToken, requireAdmin, userController.getUserDetail);

module.exports = router;