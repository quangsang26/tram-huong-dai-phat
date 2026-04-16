import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Không tải được người dùng");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <>
      <Header />
      <main className="container section">
        <h1>Admin - Quản lý khách hàng</h1>
        {message && <p className="auth-message">{message}</p>}

        <div className="admin-products-list">
          {users.map((user) => (
            <div key={user.id} className="order-card">
              <h3>{user.full_name}</h3>
              <p>Email: {user.email}</p>
              <p>SĐT: {user.phone || "Chưa có"}</p>
              <p>Vai trò: {user.role}</p>

              <div className="product-actions">
                <Link to={`/admin/users/${user.id}`} className="outline-btn">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default AdminUsersPage;