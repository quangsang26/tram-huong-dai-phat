const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const productRoutes     = require("./routes/product.routes");
const authRoutes        = require("./routes/auth.routes");
const orderRoutes       = require("./routes/order.routes");
const uploadRoutes      = require("./routes/upload.routes");
const categoryRoutes    = require("./routes/category.routes");
const userRoutes        = require("./routes/user.routes");
const dashboardRoutes   = require("./routes/dashboard.routes");
const accountRoutes     = require("./routes/account.routes");
const momoRoutes        = require("./routes/momo.routes");
const superadminRoutes  = require("./routes/superadmin.routes");
const bannerRoutes      = require("./routes/banner.routes");   // ← phải ở đây
const productImageRoutes = require("./routes/productImage.routes");

const app = express();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ═══════════════════════════════════════════════════════════
// 🔒 FIX CORS: Chỉ cho phép frontend của mình gọi API
//    Trước: app.use(cors())  ← mọi domain đều gọi được
//    Sau:   chỉ cho phép domain trong FRONTEND_URL
// ═══════════════════════════════════════════════════════════
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (Postman, mobile app)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("CORS: Domain không được phép"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.json({ message: "Backend Trầm Hương Đại Phát đang chạy" });
});

// ═══════════════════════════════════════════════════════════
// 🔒 ĐÃ XOÁ: /api/test-db — endpoint này lộ thông tin cấu hình DB
//    (DB_USER, DB_HOST, DB_NAME, DB_PORT) ra ngoài internet
// ═══════════════════════════════════════════════════════════

app.use("/api", productRoutes);
app.use("/api", authRoutes);
app.use("/api", orderRoutes);
app.use("/api", uploadRoutes);
app.use("/api", categoryRoutes);
app.use("/api", userRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", accountRoutes);
app.use("/api", momoRoutes);
app.use("/api", superadminRoutes);
app.use("/api", bannerRoutes);
app.use("/api", productImageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại port ${PORT}`);
});

