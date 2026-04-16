const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const pool = require("./config/db");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const uploadRoutes = require("./routes/upload.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const accountRoutes = require("./routes/account.routes");
const momoRoutes = require("./routes/momo.routes");

const app = express();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.json({ message: "Backend Trầm Hương Đại Phát đang chạy" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Kết nối PostgreSQL thành công",
      time: result.rows[0],
      dbConfig: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      },
    });
  } catch (error) {
    console.error("Lỗi kết nối DB:", error.message);
    res.status(500).json({
      message: "Kết nối PostgreSQL thất bại",
      error: error.message,
    });
  }
});

app.use("/api", productRoutes);
app.use("/api", authRoutes);
app.use("/api", orderRoutes);
app.use("/api", uploadRoutes);
app.use("/api", categoryRoutes);
app.use("/api", userRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", accountRoutes);
app.use("/api", momoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Uploads served from: ${uploadDir}`);
  console.log("DB_USER =", process.env.DB_USER);
  console.log("DB_HOST =", process.env.DB_HOST);
  console.log("DB_NAME =", process.env.DB_NAME);
  console.log("DB_PORT =", process.env.DB_PORT);
});