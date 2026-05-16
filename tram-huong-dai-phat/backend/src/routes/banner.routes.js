const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// Public — trang chủ gọi
router.get("/banners", bannerController.getActiveBanners);

// Admin — quản lý banner
router.get("/admin/banners", verifyToken, requireAdmin, bannerController.getAllBanners);
router.post("/admin/banners", verifyToken, requireAdmin, bannerController.createBanner);
router.put("/admin/banners/:id", verifyToken, requireAdmin, bannerController.updateBanner);
router.delete("/admin/banners/:id", verifyToken, requireAdmin, bannerController.deleteBanner);

module.exports = router;
