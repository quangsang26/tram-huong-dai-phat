const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email]);
  return result.rows[0];
};

const createUser = async ({ full_name, email, password, phone, address }) => {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password, phone, address, role)
     VALUES ($1, $2, $3, $4, $5, 'customer')
     RETURNING id, full_name, email, phone, address, role, created_at`,
    [full_name, email, password, phone, address]
  );
  return result.rows[0];
};

// ── OTP ───────────────────────────────────────────────────────

/** Lưu OTP 4 số (hết hạn sau 15 phút, xoá OTP cũ trước) */
const saveOTP = async (userId, otp) => {
  await pool.query(`DELETE FROM password_reset_otps WHERE user_id = $1`, [userId]);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

  await pool.query(
    `INSERT INTO password_reset_otps (user_id, otp, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, otp, expiresAt]
  );
};

/** Tìm OTP hợp lệ (chưa dùng, chưa hết hạn) */
const findValidOTP = async (email, otp) => {
  const result = await pool.query(
    `SELECT o.*, u.email, u.full_name
     FROM password_reset_otps o
     JOIN users u ON u.id = o.user_id
     WHERE u.email = $1
       AND o.otp = $2
       AND o.used = FALSE
       AND o.expires_at > NOW()
     ORDER BY o.created_at DESC
     LIMIT 1`,
    [email, otp]
  );
  return result.rows[0] || null;
};

/** Đặt mật khẩu mới + đánh dấu OTP đã dùng */
const resetPasswordByOTP = async (email, otp, hashedPassword) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Tìm OTP hợp lệ
    const otpRow = await client.query(
      `SELECT o.id, o.user_id
       FROM password_reset_otps o
       JOIN users u ON u.id = o.user_id
       WHERE u.email = $1 AND o.otp = $2
         AND o.used = FALSE AND o.expires_at > NOW()
       LIMIT 1`,
      [email, otp]
    );

    if (otpRow.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const { user_id, id: otpId } = otpRow.rows[0];

    // Cập nhật mật khẩu
    await client.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, user_id]);

    // Đánh dấu OTP đã dùng
    await client.query(`UPDATE password_reset_otps SET used = TRUE WHERE id = $1`, [otpId]);

    await client.query("COMMIT");
    return user_id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  saveOTP,
  findValidOTP,
  resetPasswordByOTP,
};