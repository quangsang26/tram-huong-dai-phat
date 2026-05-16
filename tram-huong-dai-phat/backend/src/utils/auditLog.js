const pool = require("../config/db");

/**
 * Ghi lại hành động của Admin vào bảng admin_logs.
 * Fire-and-forget: không throw lỗi ra ngoài, không block response.
 *
 * @param {object} admin       - req.user từ JWT { id, full_name, email, role }
 * @param {string} action      - Ví dụ: "TẠO SẢN PHẨM", "CẬP NHẬT ĐƠN HÀNG"
 * @param {string} targetType  - "product" | "order" | "category" | "admin_account"
 * @param {number|null} targetId - ID của đối tượng bị tác động
 * @param {string} detail      - Mô tả chi tiết (tên sản phẩm, giá cũ→mới, v.v.)
 */
const logAdminAction = async (admin, action, targetType, targetId, detail) => {
  try {
    await pool.query(
      `INSERT INTO admin_logs
         (admin_id, admin_name, admin_role, action, target_type, target_id, detail)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        admin.id,
        admin.full_name || admin.email,
        admin.role,
        action,
        targetType || null,
        targetId || null,
        detail || null,
      ]
    );
  } catch (err) {
    // Log ra console nhưng không làm hỏng response chính
    console.error("[AuditLog] Lỗi ghi audit log:", err.message);
  }
};

module.exports = { logAdminAction };
