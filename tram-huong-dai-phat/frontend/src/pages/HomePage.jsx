import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      const res = await api.get("/products", { params });
      const rawProducts = res.data?.data || [];

      // Chỉ ẩn sản phẩm có status = hidden
      const visibleProducts = rawProducts.filter(
        (product) => product.status !== "hidden"
      );

      setProducts(visibleProducts);
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const featuredCategories = categories.slice(0, 3);

  // Ưu tiên sản phẩm active trước, sau đó mới tới out_of_stock
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const order = {
        active: 1,
        out_of_stock: 2,
        hidden: 3,
      };

      return (order[a.status] || 99) - (order[b.status] || 99);
    });
  }, [products]);

  return (
    <>
      <Header />

      <main id="home">
        <section className="hero-section">
          <div className="hero-left">
            <div className="hero-overlay">
              <div className="hero-content">
                <p className="hero-subtitle">Trầm Hương Đại Phát</p>
                <h1>
                  TINH HOA THIÊN NHIÊN,
                  <br />
                  KHỞI ĐẦU BÌNH AN.
                </h1>
                <p className="hero-desc">
                  Khám phá bộ sưu tập vòng tay, nhang trầm và quà tặng trầm hương
                  theo phong cách sang trọng, tinh tế và gần gũi thiên nhiên.
                </p>

                <div className="hero-buttons">
                  <a href="#products" className="gold-btn large-btn">
                    Mua ngay
                  </a>
                  <a href="#categories" className="outline-light-btn large-btn">
                    Xem danh mục
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="side-block">
              <h3 className="side-title">Danh mục nổi bật</h3>
              <div className="mini-category-grid">
                {featuredCategories.map((category, index) => (
                  <div className="mini-category-card" key={category.id}>
                    <img
                      src={`https://picsum.photos/400/300?random=${index + 11}`}
                      alt={category.name}
                    />
                    <div className="mini-category-content">
                      <h4>{category.name}</h4>
                      <p>{category.description || "Sản phẩm trầm hương cao cấp"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="premium-section">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag">Bộ sưu tập</p>
              <h2>Danh mục nổi bật</h2>
            </div>

            <div className="featured-category-row">
              {featuredCategories.map((category, index) => (
                <div className="featured-category-large" key={category.id}>
                  <img
                    src={`https://picsum.photos/700/500?random=${index + 31}`}
                    alt={category.name}
                  />
                  <div className="featured-category-overlay">
                    <h3>{category.name}</h3>
                    <p>{category.description || "Tinh tế, sang trọng, tự nhiên"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
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
              <Link to="/cart" className="gold-btn large-btn">
                Xem giỏ hàng
              </Link>
            </div>
          </div>
        </section>

        <section id="about" className="premium-section about-section">
          <div className="container about-grid">
            <div className="about-image-box">
              <img
                src="https://picsum.photos/700/500?random=90"
                alt="Trầm hương cao cấp"
              />
            </div>

            <div className="about-content">
              <p className="section-tag">Về thương hiệu</p>
              <h2>Giá trị đến từ sự tinh tuyển và an yên</h2>
              <p>
                Trầm Hương Đại Phát hướng đến các sản phẩm mang giá trị sử dụng thực
                tế, tính thẩm mỹ cao và cảm giác thư thái cho không gian sống.
              </p>
              <p>
                Từ vòng tay trầm, nhang trầm cho đến quà tặng, mỗi sản phẩm đều được
                chọn lọc theo tinh thần mộc mạc, sang trọng và phù hợp để sử dụng
                hoặc biếu tặng.
              </p>

              <div className="about-points">
                <div className="about-point">✓ Thiết kế sang trọng, tinh tế</div>
                <div className="about-point">✓ Phù hợp quà tặng và phong thủy</div>
                <div className="about-point">✓ Dễ sử dụng trong đời sống hằng ngày</div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="site-footer">
          <div className="container footer-grid">
            <div>
              <h3>Trầm Hương Đại Phát</h3>
              <p>
                Website bán các sản phẩm trầm hương theo phong cách hiện đại và cao cấp.
              </p>
            </div>

            <div>
              <h4>Liên kết nhanh</h4>
              <ul>
                <li>
                  <a href="#home">Trang chủ</a>
                </li>
                <li>
                  <a href="#categories">Danh mục</a>
                </li>
                <li>
                  <a href="#products">Sản phẩm</a>
                </li>
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