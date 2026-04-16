const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const { Pool } = require("pg");

const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "tram_huong_dai_phat",
  password: process.env.DB_PASSWORD || "123456",
  port: Number(process.env.DB_PORT) || 5432,
};

const pool = new Pool(dbConfig);

pool.on("connect", () => {
  console.log("Kết nối PostgreSQL thành công!");
});

pool.on("error", (err) => {
  console.error("Lỗi PostgreSQL:", err.message);
});

module.exports = pool;