import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [message, setMessage] = useState("");

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

      const visibleProducts = rawProducts.filter(
        (product) => product.status !== "hidden"
      );

      setProducts(visibleProducts);
      setMessage("");
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      setMessage("Không thể tải danh sách sản phẩm");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const list = [...products];

    list.sort((a, b) => {
      const statusOrder = {
        active: 1,
        out_of_stock: 2,
        hidden: 3,
      };

      const statusCompare =
        (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);

      if (statusCompare !== 0) return statusCompare;

      if (sortBy === "price_asc") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "price_desc") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }

      return Number(b.id) - Number(a.id);
    });

    return list;
  }, [products, sortBy]);

  return (
    <>
      <Header />

      <main className="container section">
        <div className="page-heading">
          <p className="section-tag">Sản phẩm</p>
          <h1>Tất cả sản phẩm</h1>
        </div>

        <div className="premium-summary-card" style={{ marginBottom: "24px" }}>
          <div className="admin-filter-grid">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: "16px" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "320px",
                padding: "14px 16px",
                border: "1px solid #ddd",
                borderRadius: "14px",
                fontSize: "15px",
                outline: "none",
                background: "#fcfbf8",
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name_asc">Tên A-Z</option>
            </select>
          </div>
        </div>

        {message && <p className="auth-message">{message}</p>}

        {sortedProducts.length === 0 ? (
          <div className="empty-state-card">
            <h3>Không tìm thấy sản phẩm phù hợp</h3>
            <p>Hãy thử đổi từ khóa tìm kiếm hoặc bộ lọc danh mục.</p>
          </div>
        ) : (
          <div className="premium-product-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default ProductListPage;