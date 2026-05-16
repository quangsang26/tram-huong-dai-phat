import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuRef = useRef(null);

  const loadCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalItems = cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
      setCartCount(totalItems);
    } catch (error) {
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    loadCartCount();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("mousedown", handleClickOutside);

    const interval = setInterval(() => {
      loadCartCount();
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const getUserInitial = () => {
    return user?.full_name?.charAt(0)?.toUpperCase() || "U";
  };

  const cartBadgeText = useMemo(() => {
    if (cartCount > 99) return "99+";
    return cartCount;
  }, [cartCount]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <div className="brand-mark">🌿</div>
          <div className="brand-text">
            <span>Trầm Hương</span>
            <strong>Đại Phát</strong>
          </div>
        </Link>

        <nav className="main-nav">
          <Link to="/">Trang chủ</Link>
          <a href="/#categories">Danh mục</a>
          <Link to="/products">Sản phẩm</Link>
          <a href="/#about">Giới thiệu</a>
          <a href="/#contact">Liên hệ</a>
        </nav>

        <div className="header-actions">
          <Link to="/cart" className="icon-btn cart-icon-btn" title="Giỏ hàng">
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartBadgeText}</span>}
          </Link>

          {user ? (
            <div className="user-dropdown" ref={menuRef}>
              <button
                type="button"
                className="user-avatar-btn"
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <div className="user-avatar-circle">{getUserInitial()}</div>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <strong>{user.full_name}</strong>
                    <span>{user.email}</span>
                    <small style={{ color: "#8b6f47", marginTop: "4px" }}>
                      Vai trò: {user.role}
                    </small>
                  </div>

                  <Link to="/account" onClick={() => setShowUserMenu(false)}>
                    Tài khoản của tôi
                  </Link>

                  <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                    Đơn hàng của tôi
                  </Link>

                  {/* ── Menu Admin (admin + super_admin) ── */}
                  {isAdmin && (
                    <>
                      <hr style={{ border: "none", borderTop: "1px solid #f0e8d8", margin: "6px 0" }} />
                      <small style={{ padding: "0 16px", color: "#b8956a", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
                        QUẢN TRỊ
                      </small>
                      <Link to="/admin/dashboard" onClick={() => setShowUserMenu(false)}>
                        Dashboard
                      </Link>
                      <Link to="/admin/products" onClick={() => setShowUserMenu(false)}>
                        Quản lý sản phẩm
                      </Link>
                      <Link to="/admin/orders" onClick={() => setShowUserMenu(false)}>
                        Quản lý đơn hàng
                      </Link>
                      <Link to="/admin/categories" onClick={() => setShowUserMenu(false)}>
                        Quản lý danh mục
                      </Link>
                      <Link to="/admin/users" onClick={() => setShowUserMenu(false)}>
                        Quản lý khách hàng
                      </Link>
                      <Link to="/admin/banners" onClick={() => setShowUserMenu(false)}>
                        Quản lý banner
                      </Link>

                    </>
                  )}

                  {/* ── Menu Super Admin (chỉ super_admin) ── */}
                  {isSuperAdmin && (
                    <>
                      <hr style={{ border: "none", borderTop: "1px solid #f0e8d8", margin: "6px 0" }} />
                      <small style={{ padding: "0 16px", color: "#7c3aed", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
                        🛡️ SUPER ADMIN
                      </small>
                      <Link to="/super-admin/admins" onClick={() => setShowUserMenu(false)}
                        style={{ color: "#6d28d9" }}>
                        Quản lý Admin
                      </Link>
                      <Link to="/super-admin/logs" onClick={() => setShowUserMenu(false)}
                        style={{ color: "#6d28d9" }}>
                        Lịch sử thao tác
                      </Link>
                      <Link to="/super-admin/stock" onClick={() => setShowUserMenu(false)}
                        style={{ color: "#6d28d9" }}>
                        Báo cáo tồn kho
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    className="user-menu-logout"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register" className="register-btn">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
