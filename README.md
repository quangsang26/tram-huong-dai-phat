# 🌿 Trầm Hương Đại Phát — E-Commerce Website

> Website thương mại điện tử fullstack dành cho cửa hàng trầm hương, xây dựng với React + Node.js + PostgreSQL.  
> Hệ thống phân quyền 3 cấp: Khách hàng / Admin / Super Admin.

🎬 **[Xem Demo Video](https://youtube.com/your-link-here)** &nbsp;|&nbsp; 📂 **[GitHub Repo](https://github.com/quangsang26/tram-huong-dai-phat)**

---

## ✨ Tính năng nổi bật

### 👤 Khách hàng
- Xem danh sách & chi tiết sản phẩm với **gallery ảnh kiểu Shopee** (click thumbnail đổi ảnh chính)
- Tìm kiếm, lọc sản phẩm theo danh mục
- Đăng ký / Đăng nhập bằng JWT
- **Quên mật khẩu qua OTP 4 số** gửi về Gmail (hết hạn sau 15 phút)
- Giỏ hàng, đặt hàng
- **Thanh toán MoMo** (tích hợp MoMo Sandbox API thật) và COD
- Xem lịch sử đơn hàng

### 🛠️ Admin
- Quản lý sản phẩm: thêm/sửa/xoá, upload nhiều ảnh (tối đa 5 ảnh/sản phẩm)
- Quản lý danh mục: đổi ảnh trực tiếp bằng hover & click
- Quản lý banner trang chủ (Hero Slideshow tự động)
- Quản lý đơn hàng: cập nhật trạng thái
- Xem danh sách khách hàng

### 🛡️ Super Admin
- Tạo / Khoá / Xoá tài khoản Admin
- **Audit Log** — xem toàn bộ lịch sử thao tác của Admin (ai sửa gì, lúc mấy giờ)
- **Báo cáo tồn kho** — theo dõi xuất nhập từng sản phẩm theo đơn hàng

---

## 🔐 Bảo mật

| Tính năng | Mô tả |
|---|---|
| JWT Authentication | Token có thời hạn 7 ngày |
| bcrypt | Hash mật khẩu với salt rounds 10 |
| Server-side price validation | Giá tính từ DB, không tin client |
| IDOR protection | User chỉ xem được đơn hàng của chính mình |
| Rate Limiting | Giới hạn 10 lần login / 15 phút / IP |
| CORS Policy | Chỉ cho phép domain frontend |
| OTP Expiry | Mã reset mật khẩu hết hạn sau 15 phút |

---

## 🛠️ Công nghệ sử dụng

| Layer | Tech |
|---|---|
| **Frontend** | React 18, Vite, React Router, Axios |
| **Backend** | Node.js, Express.js, RESTful API |
| **Database** | PostgreSQL, pgAdmin 4 |
| **Auth** | JWT, bcrypt, OTP Email (Nodemailer) |
| **Payment** | MoMo Sandbox API |
| **Tools** | Git, GitHub, Postman, VS Code |

---

## 📁 Cấu trúc dự án

```
tram-huong-dai-phat/
├── frontend/               # React + Vite
│   └── src/
│       ├── components/     # Header, ProductCard, HeroSlideshow...
│       ├── pages/          # HomePage, ProductDetail, Admin pages...
│       └── services/       # API calls, cart logic
│
├── backend/                # Node.js + Express
│   └── src/
│       ├── controllers/    # Xử lý request
│       ├── repositories/   # Truy vấn database
│       ├── routes/         # Định nghĩa API endpoints
│       ├── middlewares/    # Auth, upload
│       └── utils/          # Email, audit log
│
└── database/
    └── schema.sql          # Cấu trúc database
```

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu
- Node.js >= 18
- PostgreSQL >= 14
- pgAdmin 4

### 1. Clone repo

```bash
git clone https://github.com/quangsang26/tram-huong-dai-phat.git
cd tram-huong-dai-phat
```

### 2. Cài đặt Database

Mở pgAdmin 4, tạo database tên `tram_huong_dai_phat`, sau đó chạy file:

```
database/schema.sql
```

### 3. Cấu hình Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tram_huong_dai_phat
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key

FRONTEND_URL=http://localhost:5173
```

Chạy backend:

```bash
npm run dev
```

Backend chạy tại: `http://localhost:5000`

### 4. Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## 📡 API Endpoints chính

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký | Public |
| POST | `/api/auth/login` | Đăng nhập | Public |
| POST | `/api/auth/forgot-password` | Gửi OTP | Public |
| POST | `/api/auth/verify-otp` | Xác nhận OTP | Public |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu | Public |
| GET | `/api/products` | Danh sách sản phẩm | Public |
| GET | `/api/products/:id` | Chi tiết sản phẩm | Public |
| POST | `/api/orders` | Tạo đơn hàng | Customer |
| GET | `/api/orders/mine` | Đơn hàng của tôi | Customer |
| GET | `/api/admin/orders` | Tất cả đơn hàng | Admin |
| GET | `/api/super-admin/logs` | Audit log | Super Admin |
| GET | `/api/super-admin/stock-report` | Báo cáo tồn kho | Super Admin |

---

## 🔑 Tài khoản test

> Tự tạo tài khoản qua `/register`, sau đó cập nhật role trong pgAdmin:

```sql
-- Cấp quyền Admin
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Cấp quyền Super Admin
UPDATE users SET role = 'super_admin' WHERE email = 'superadmin@example.com';
```

---

## 📸 Screenshots

> *(Thêm ảnh chụp màn hình trang chủ, trang sản phẩm, admin dashboard vào đây)*

---

## 👨‍💻 Tác giả

**Cán Quang Sáng**  
Fresher Full-Stack Developer  
📧 qs26k5@gmail.com | 📍 Quận 12, TP.HCM  
🔗 [GitHub](https://github.com/quangsang26)

---

## 📄 License

MIT License — free to use for learning and personal projects.
