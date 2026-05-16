const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Gửi email chứa mã OTP 4 số
 */
const sendOTPEmail = async (toEmail, toName, otp) => {
  const mailOptions = {
    from: `"Trầm Hương Đại Phát" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Mã xác nhận đặt lại mật khẩu: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f8f5f0;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:20px;overflow:hidden;
                            box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4a3520,#7b5b28);
                              padding:32px 40px;text-align:center;">
                    <p style="margin:0;color:#f0d898;font-size:12px;letter-spacing:2px;
                               text-transform:uppercase;">Trầm Hương</p>
                    <h1 style="margin:6px 0 0;color:#ffffff;font-size:24px;font-weight:700;">
                      Đại Phát
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px 28px;">
                    <p style="margin:0 0 6px;color:#9a8a7a;font-size:14px;">
                      Xin chào, <strong style="color:#4a3520;">${toName}</strong>
                    </p>
                    <h2 style="margin:0 0 20px;color:#2d1f16;font-size:20px;">
                      Mã xác nhận đặt lại mật khẩu
                    </h2>
                    <p style="margin:0 0 24px;color:#5a4a3a;font-size:15px;line-height:1.6;">
                      Đây là mã <strong>4 chữ số</strong> để đặt lại mật khẩu của bạn:
                    </p>

                    <!-- OTP Box -->
                    <div style="text-align:center;margin:0 0 28px;">
                      <div style="display:inline-block;background:linear-gradient(135deg,#fef9ee,#fff8e1);
                                  border:2px solid #c89b3c;border-radius:16px;padding:24px 48px;">
                        <span style="font-size:52px;font-weight:900;letter-spacing:16px;
                                     color:#4a3520;font-family:monospace;">
                          ${otp}
                        </span>
                      </div>
                    </div>

                    <!-- Warning -->
                    <div style="background:#fef9ee;border:1px solid #f0d898;border-radius:12px;
                                padding:14px 18px;margin-bottom:20px;">
                      <p style="margin:0;color:#7b5b28;font-size:13px;line-height:1.6;">
                        ⏰ <strong>Mã có hiệu lực trong 15 phút.</strong><br/>
                        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                      </p>
                    </div>

                    <p style="margin:0;color:#b8a898;font-size:12px;">
                      Không chia sẻ mã này với bất kỳ ai.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f5f0;padding:20px 40px;
                              border-top:1px solid #ede5d8;text-align:center;">
                    <p style="margin:0;color:#b8a898;font-size:12px;">
                      © 2026 Trầm Hương Đại Phát · Email tự động, vui lòng không trả lời
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };