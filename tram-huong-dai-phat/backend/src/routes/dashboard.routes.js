const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.get(
  "/admin/dashboard",
  verifyToken,
  requireAdmin,
  dashboardController.getDashboardStats
);

module.exports = router;