import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import HeroSlideshow from "../components/HeroSlideshow";

const STATS = [
  { number: "10+",  label: "Năm kinh nghiệm" },
  { number: "500+", label: "Khách hàng tin dùng" },
  { number: "50+",  label: "Loại sản phẩm" },
  { number: "100%", label: "Nguồn gốc tự nhiên" },
];

function HomePage() {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [search, setSearch]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCategories = async () => {
    try {
      // ?t= để tránh browser cache trả 304
      const res = await api.get(`/categories?t=${Date.now()}`);
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      const res = await api.get("/products", { params });
      const rawProducts = res.data?.data || [];
      setProducts(rawProducts.filter((p) => p.status !== "hidden"));
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [search, selectedCategory]);

  const featuredCategories = categories.slice(0, 3);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const order = { active: 1, out_of_stock: 2, hidden: 3 };
      return (order[a.status] || 99) - (order[b.status] || 99);
    });
  }, [products]);

  return (
    <>
      <Header />
      <main id="home">

        {/* ── Hero Slideshow ── */}
        <HeroSlideshow />

        {/* ── Danh mục nổi bật ── */}
        <section id="categories" className="premium-section">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag">Bộ sưu tập</p>
              <h2>Danh mục nổi bật</h2>
            </div>

            <div className="featured-category-row">
              {featuredCategories.length === 0 ? (
                <p style={{ color: "#9a8a7a" }}>Chưa có danh mục nào.</p>
              ) : (
                featuredCategories.map((category) => (
                  <div className="featured-category-large" key={category.id}>
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.style.background =
                            "linear-gradient(135deg,#4a3520,#7b5b28)";
                        }}
                      />
                    ) : (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(135deg,#2d1f16 0%,#4a3520 50%,#7b5b28 100%)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 72,
                      }}>🌿</div>
                    )}
                    <div className="featured-category-overlay">
                      <h3>{category.name}</h3>
                      <p>{category.description || "Tinh tế, sang trọng, tự nhiên"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Sản phẩm ── */}
        <section id="products" className="premium-section product-showcase">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag">Sản phẩm</p>
              <h2>Sản phẩm của chúng tôi</h2>
            </div>

            <div className="filter-bar">
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="premium-product-grid">
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p>Không tìm thấy sản phẩm phù hợp.</p>
              )}
            </div>

            <div className="center-box">
              <Link to="/cart" className="gold-btn large-btn">Xem giỏ hàng</Link>
            </div>
          </div>
        </section>

        {/* ── Về thương hiệu ── */}
        <section id="about" className="premium-section about-section">
          <div className="container">

            {/* Thống kê số liệu */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 56,
            }}>
              {STATS.map((stat) => (
                <div key={stat.label} style={{
                  background: "#fff",
                  border: "1px solid #eadfce",
                  borderRadius: 20,
                  padding: "28px 16px",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  <p style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#c89b3c",
                    margin: "0 0 6px",
                    lineHeight: 1,
                  }}>{stat.number}</p>
                  <p style={{ margin: 0, color: "#7a6b5f", fontSize: 14 }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Nội dung chính */}
            <div className="about-grid">

              {/* Bên trái: ảnh thật — đổi tên ảnh thành about-image.jpg
                  rồi copy vào thư mục backend/uploads/ là hiện lên */}
              <div className="about-image-box">
                <img
                  src="https://tram-huong-dai-phat.onrender.com/uploads/about-image.jpg"
                  alt="Vườn Trầm Hương Đại Phát"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
                {/* Placeholder — tự ẩn khi có ảnh thật */}
                <div style={{
                  display: "none",
                  width: "100%",
                  height: 480,
                  borderRadius: 24,
                  background: "linear-gradient(135deg,#2d1f16 0%,#4a3520 40%,#7b5b28 70%,#c89b3c 100%)",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 20,
                  boxShadow: "0 14px 28px rgba(0,0,0,0.15)",
                }}>
                  <span style={{ fontSize: 72 }}>🌿</span>
                  <div style={{ textAlign: "center", padding: "0 32px" }}>
                    <p style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: 700,
                      margin: "0 0 8px",
                    }}>Vườn Trầm Hương Đại Phát</p>
                    <p style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 13,
                      margin: 0,
                      lineHeight: 1.6,
                    }}>
                      Đổi tên ảnh thành <strong style={{ color: "#f0d898" }}>about-image.jpg</strong><br />
                      và copy vào thư mục <strong style={{ color: "#f0d898" }}>backend/uploads/</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bên phải: nội dung */}
              <div className="about-content">
                <p className="section-tag">Về thương hiệu</p>
                <h2>Giá trị đến từ sự tinh tuyển và an yên</h2>
                <p>
                  Trầm Hương Đại Phát hướng đến các sản phẩm mang giá trị sử dụng
                  thực tế, tính thẩm mỹ cao và cảm giác thư thái cho không gian sống.
                </p>
                <p>
                  Từ vòng tay trầm, nhang trầm cho đến quà tặng, mỗi sản phẩm đều
                  được chọn lọc theo tinh thần mộc mạc, sang trọng và phù hợp để
                  sử dụng hoặc biếu tặng.
                </p>
                <div className="about-points">
                  <div className="about-point">✓ Thiết kế sang trọng, tinh tế</div>
                  <div className="about-point">✓ Phù hợp quà tặng và phong thủy</div>
                  <div className="about-point">✓ Dễ sử dụng trong đời sống hằng ngày</div>
                  <div className="about-point">✓ Nguồn gốc tự nhiên, an toàn sức khỏe</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer id="contact" className="site-footer">
          <div className="container footer-grid">
            <div>
              <h3>Trầm Hương Đại Phát</h3>
              <p>Website bán các sản phẩm trầm hương theo phong cách hiện đại và cao cấp.</p>
            </div>
            <div>
              <h4>Liên kết nhanh</h4>
              <ul>
                <li><a href="#home">Trang chủ</a></li>
                <li><a href="#categories">Danh mục</a></li>
                <li><a href="#products">Sản phẩm</a></li>
              </ul>
            </div>
            <div>
              <h4>Liên hệ</h4>
              <p>Email: qs26k5@gmail.com</p>
              <p>Hotline: 0834227889</p>
              <p>Địa chỉ: Việt Nam</p>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 Trầm Hương Đại Phát. All rights reserved.
          </div>
        </footer>

      </main>
    </>
  );
}

export default HomePage;