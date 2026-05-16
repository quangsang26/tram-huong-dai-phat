const pool = require("../config/db");
const bcrypt = require("bcrypt");

// ── Quản lý tài khoản Admin ───────────────────────────────────

/** Lấy tất cả Admin (không lấy super_admin, không lấy customer) */
const getAllAdmins = async () => {
  const result = await pool.query(
    `SELECT id, full_name, email, phone, role, is_locked, created_at
     FROM users
     WHERE role = 'admin'
     ORDER BY created_at DESC`
  );
  return result.rows;
};

/** Tạo tài khoản Admin mới */
const createAdmin = async ({ full_name, email, password, phone }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, 'admin')
     RETURNING id, full_name, email, phone, role, is_locked, created_at`,
    [full_name, email, hashedPassword, phone || null]
  );
  return result.rows[0];
};

/** Kiểm tra email đã tồn tại chưa */
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
};

/** Khoá hoặc mở khoá tài khoản Admin */
const toggleAdminLock = async (adminId, isLocked) => {
  const result = await pool.query(
    `UPDATE users
     SET is_locked = $1
     WHERE id = $2 AND role = 'admin'
     RETURNING id, full_name, email, role, is_locked`,
    [isLocked, adminId]
  );
  return result.rows[0] || null;
};

/** Xoá tài khoản Admin */
const deleteAdmin = async (adminId) => {
  const result = await pool.query(
    `DELETE FROM users
     WHERE id = $1 AND role = 'admin'
     RETURNING id, full_name, email`,
    [adminId]
  );
  return result.rows[0] || null;
};

// ── Audit Log ─────────────────────────────────────────────────

/** Lấy danh sách audit log, hỗ trợ lọc theo admin hoặc hành động */
const getAuditLogs = async ({ adminId, action, limit = 100 } = {}) => {
  let query = `
    SELECT
      al.id,
      al.admin_id,
      al.admin_name,
      al.admin_role,
      al.action,
      al.target_type,
      al.target_id,
      al.detail,
      al.created_at
    FROM admin_logs al
    WHERE 1 = 1
  `;
  const values = [];

  if (adminId) {
    values.push(adminId);
    query += ` AND al.admin_id = $${values.length}`;
  }

  if (action) {
    values.push(`%${action}%`);
    query += ` AND al.action ILIKE $${values.length}`;
  }

  values.push(limit);
  query += ` ORDER BY al.created_at DESC LIMIT $${values.length}`;

  const result = await pool.query(query, values);
  return result.rows;
};

// ── Báo cáo tồn kho ───────────────────────────────────────────

/**
 * Báo cáo xuất kho từ đơn hàng (đơn đã xác nhận hoặc đang giao)
 * Bao gồm: tên SP, tồn kho hiện tại, tổng đã bán, số đơn
 */
const getStockReport = async () => {
  const result = await pool.query(
    `SELECT
       p.id                                      AS product_id,
       p.name                                    AS product_name,
       p.stock                                   AS current_stock,
       p.status                                  AS product_status,
       c.name                                    AS category_name,
       COALESCE(SUM(oi.quantity), 0)             AS total_sold,
       COUNT(DISTINCT oi.order_id)               AS total_orders,
       COALESCE(SUM(oi.quantity * oi.price), 0)  AS total_revenue
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o
            ON o.id = oi.order_id
           AND o.order_status NOT IN ('cancelled')
     GROUP BY p.id, p.name, p.stock, p.status, c.name
     ORDER BY total_sold DESC`
  );
  return result.rows;
};

/**
 * Chi tiết xuất kho theo từng đơn hàng của 1 sản phẩm
 */
const getStockMovementsByProduct = async (productId) => {
  const result = await pool.query(
    `SELECT
       o.id            AS order_id,
       o.customer_name,
       o.order_status,
       o.payment_status,
       o.created_at    AS order_date,
       oi.quantity,
       oi.price
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.product_id = $1
     ORDER BY o.created_at DESC`,
    [productId]
  );
  return result.rows;
};

module.exports = {
  getAllAdmins,
  createAdmin,
  findUserByEmail,
  toggleAdminLock,
  deleteAdmin,
  getAuditLogs,
  getStockReport,
  getStockMovementsByProduct,
};
