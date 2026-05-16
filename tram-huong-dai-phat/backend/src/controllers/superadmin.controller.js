const superadminRepository = require("../repositories/superadmin.repository");
const { logAdminAction } = require("../utils/auditLog");

// ── Quản lý tài khoản Admin ───────────────────────────────────

/** GET /api/super-admin/admins */
const getAdmins = async (req, res) => {
  try {
    const admins = await superadminRepository.getAllAdmins();
    res.status(200).json({
      message: "Lấy danh sách Admin thành công",
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách Admin",
      error: error.message,
    });
  }
};

/** POST /api/super-admin/admins */
const createAdmin = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu" });
    }

    const existing = await superadminRepository.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email này đã tồn tại trong hệ thống" });
    }

    const newAdmin = await superadminRepository.createAdmin({
      full_name,
      email,
      password,
      phone,
    });

    // Ghi audit log
    logAdminAction(
      req.user,
      "TẠO TÀI KHOẢN ADMIN",
      "admin_account",
      newAdmin.id,
      `Tạo admin mới: ${full_name} (${email})`
    );

    res.status(201).json({
      message: "Tạo tài khoản Admin thành công",
      data: newAdmin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi tạo tài khoản Admin",
      error: error.message,
    });
  }
};

/** PATCH /api/super-admin/admins/:id/lock */
const lockAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_locked } = req.body;

    if (typeof is_locked !== "boolean") {
      return res
        .status(400)
        .json({ message: "Vui lòng truyền is_locked: true hoặc false" });
    }

    const updated = await superadminRepository.toggleAdminLock(id, is_locked);

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản Admin này" });
    }

    const actionLabel = is_locked ? "KHOÁ TÀI KHOẢN ADMIN" : "MỞ KHOÁ ADMIN";
    logAdminAction(
      req.user,
      actionLabel,
      "admin_account",
      Number(id),
      `${is_locked ? "Khoá" : "Mở khoá"} admin: ${updated.full_name} (${updated.email})`
    );

    res.status(200).json({
      message: `${is_locked ? "Khoá" : "Mở khoá"} tài khoản Admin thành công`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái Admin",
      error: error.message,
    });
  }
};

/** DELETE /api/super-admin/admins/:id */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await superadminRepository.deleteAdmin(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản Admin này" });
    }

    logAdminAction(
      req.user,
      "XOÁ TÀI KHOẢN ADMIN",
      "admin_account",
      Number(id),
      `Xoá admin: ${deleted.full_name} (${deleted.email})`
    );

    res.status(200).json({
      message: "Xoá tài khoản Admin thành công",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi xoá tài khoản Admin",
      error: error.message,
    });
  }
};

// ── Audit Log ─────────────────────────────────────────────────

/** GET /api/super-admin/logs?adminId=&action=&limit= */
const getAuditLogs = async (req, res) => {
  try {
    const { adminId, action, limit } = req.query;

    const logs = await superadminRepository.getAuditLogs({
      adminId: adminId ? Number(adminId) : undefined,
      action: action || undefined,
      limit: limit ? Number(limit) : 200,
    });

    res.status(200).json({
      message: "Lấy audit log thành công",
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy audit log",
      error: error.message,
    });
  }
};

// ── Báo cáo tồn kho ───────────────────────────────────────────

/** GET /api/super-admin/stock-report */
const getStockReport = async (req, res) => {
  try {
    const data = await superadminRepository.getStockReport();

    res.status(200).json({
      message: "Lấy báo cáo tồn kho thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy báo cáo tồn kho",
      error: error.message,
    });
  }
};

/** GET /api/super-admin/stock-report/:productId */
const getStockMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const data = await superadminRepository.getStockMovementsByProduct(productId);

    res.status(200).json({
      message: "Lấy lịch sử xuất kho thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy lịch sử xuất kho",
      error: error.message,
    });
  }
};

module.exports = {
  getAdmins,
  createAdmin,
  lockAdmin,
  deleteAdmin,
  getAuditLogs,
  getStockReport,
  getStockMovements,
};
