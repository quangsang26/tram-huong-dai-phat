const bannerRepository = require("../repositories/banner.repository");
const { logAdminAction } = require("../utils/auditLog");

/** GET /api/banners — Public: trang chủ lấy danh sách slideshow */
const getActiveBanners = async (req, res) => {
  try {
    const banners = await bannerRepository.getActiveBanners();
    res.status(200).json({ message: "Lấy danh sách banner thành công", data: banners });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy banner", error: error.message });
  }
};

/** GET /api/admin/banners — Admin: quản lý tất cả banner */
const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerRepository.getAllBanners();
    res.status(200).json({ message: "Lấy tất cả banner thành công", data: banners });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** POST /api/admin/banners */
const createBanner = async (req, res) => {
  try {
    const { title, description, image_url, sort_order } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ message: "Vui lòng nhập tiêu đề và ảnh" });
    }

    const banner = await bannerRepository.createBanner({
      title, description, image_url, sort_order,
    });

    logAdminAction(req.user, "TẠO BANNER", "banner", banner.id, `Banner: "${title}"`);

    res.status(201).json({ message: "Thêm banner thành công", data: banner });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** PUT /api/admin/banners/:id */
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, is_active, sort_order } = req.body;

    const banner = await bannerRepository.updateBanner(id, {
      title, description, image_url, is_active, sort_order,
    });

    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    logAdminAction(req.user, "CẬP NHẬT BANNER", "banner", Number(id), `Banner: "${title}"`);

    res.status(200).json({ message: "Cập nhật banner thành công", data: banner });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** DELETE /api/admin/banners/:id */
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await bannerRepository.deleteBanner(id);

    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    logAdminAction(req.user, "XOÁ BANNER", "banner", Number(id), `Đã xoá: "${banner.title}"`);

    res.status(200).json({ message: "Xoá banner thành công", data: banner });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
