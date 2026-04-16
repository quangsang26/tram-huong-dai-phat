import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setDashboard(res.data.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Không tải được dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const monthlyRevenueData = useMemo(() => {
    if (!dashboard?.monthlyRevenue) return [];

    const maxRevenue = Math.max(
      ...dashboard.monthlyRevenue.map((item) => Number(item.revenue)),
      0
    );

    return dashboard.monthlyRevenue.map((item) => ({
      ...item,
      revenue: Number(item.revenue),
      heightPercent:
        maxRevenue > 0 ? Math.max((Number(item.revenue) / maxRevenue) * 100, 8) : 8,
    }));
  }, [dashboard]);

  if (message) {
    return (
      <>
        <Header />
        <main className="container section">
          <p className="auth-message">{message}</p>
        </main>
      </>
    );
  }

  if (!dashboard) {
    return (
      <>
        <Header />
        <main className="container section">
          <p>Đang tải dashboard...</p>
        </main>
      </>
    );
  }

  const { overview, bestSellingProducts, recentOrders } = dashboard;

  return (
    <>
      <Header />
      <main className="container section">
        <div className="page-heading">
          <p className="section-tag">Quản trị</p>
          <h1>Dashboard</h1>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <p className="dashboard-label">Tổng sản phẩm</p>
            <h2>{overview.total_products}</h2>
          </div>

          <div className="dashboard-card">
            <p className="dashboard-label">Tổng đơn hàng</p>
            <h2>{overview.total_orders}</h2>
          </div>

          <div className="dashboard-card">
            <p className="dashboard-label">Khách hàng</p>
            <h2>{overview.total_users}</h2>
          </div>

          <div className="dashboard-card">
            <p className="dashboard-label">Đơn chờ xử lý</p>
            <h2>{overview.pending_orders}</h2>
          </div>

          <div className="dashboard-card dashboard-card-wide">
            <p className="dashboard-label">Tổng doanh thu</p>
            <h2>{Number(overview.total_revenue).toLocaleString("vi-VN")} đ</h2>
          </div>
        </div>

        <div className="order-detail-card revenue-chart-card">
          <div className="chart-header">
            <div>
              <p className="section-tag">Biểu đồ</p>
              <h2>Doanh thu theo tháng</h2>
            </div>
          </div>

          {monthlyRevenueData.length > 0 ? (
            <div className="revenue-chart">
              <div className="revenue-chart-bars">
                {monthlyRevenueData.map((item, index) => (
                  <div key={index} className="revenue-chart-item">
                    <div className="revenue-chart-bar-wrap">
                      <div
                        className="revenue-chart-bar"
                        style={{ height: `${item.heightPercent}%` }}
                        title={`${item.month_label}: ${item.revenue.toLocaleString("vi-VN")} đ`}
                      />
                    </div>
                    <p className="revenue-chart-value">
                      {item.revenue.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="revenue-chart-label">{item.month_label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Chưa có dữ liệu doanh thu để hiển thị biểu đồ.</p>
          )}
        </div>

        <div className="dashboard-sections">
          <div className="order-detail-card">
            <h2>Sản phẩm bán chạy</h2>
            {bestSellingProducts.length > 0 ? (
              <div className="orders-list">
                {bestSellingProducts.map((item, index) => (
                  <div key={index} className="order-card">
                    <h3>{item.product_name}</h3>
                    <p>Đã bán: {item.total_sold}</p>
                    <p>Doanh thu: {Number(item.total_amount).toLocaleString("vi-VN")} đ</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có dữ liệu bán hàng.</p>
            )}
          </div>

          <div className="order-detail-card">
            <h2>Đơn hàng gần đây</h2>
            {recentOrders.length > 0 ? (
              <div className="orders-list">
                {recentOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <h3>Đơn #{order.id}</h3>
                    <p>Khách: {order.customer_name}</p>
                    <p>Tổng tiền: {Number(order.total_amount).toLocaleString("vi-VN")} đ</p>
                    <p>Thanh toán: {order.payment_status}</p>
                    <p>Trạng thái: {order.order_status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có đơn hàng.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminDashboardPage;