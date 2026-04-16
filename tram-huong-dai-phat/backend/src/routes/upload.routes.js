const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.post(
  "/admin/upload",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Không có file ảnh được upload",
        });
      }

      const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      res.status(200).json({
        message: "Upload ảnh thành công",
        data: {
          filename: req.file.filename,
          image_url: imageUrl,
        },
      });
    } catch (error) {
      console.error("Lỗi upload ảnh:", error.message);
      res.status(500).json({
        message: "Upload ảnh thất bại",
        error: error.message,
      });
    }
  }
);

module.exports = router;