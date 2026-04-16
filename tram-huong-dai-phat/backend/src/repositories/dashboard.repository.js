const pool = require("../config/db");

const getOverviewStats = async () => {
  const totalProductsQuery = `SELECT COUNT(*)::int AS total_products FROM products`;
  const totalOrdersQuery = `SELECT COUNT(*)::int AS total_orders FROM orders`;
  const totalUsersQuery = `SELECT COUNT(*)::int AS total_users FROM users WHERE role = 'customer'`;
  const pendingOrdersQuery = `SELECT COUNT(*)::int AS pending_orders FROM orders WHERE order_status = 'pending'`;
  const revenueQuery = `
    SELECT COALESCE(SUM(total_amount), 0)::numeric AS total_revenue
    FROM orders
    WHERE order_status IN ('confirmed', 'shipping', 'completed')
  `;

  const [
    totalProducts,
    totalOrders,
    totalUsers,
    pendingOrders,
    revenue,
  ] = await Promise.all([
    pool.query(totalProductsQuery),
    pool.query(totalOrdersQuery),
    pool.query(totalUsersQuery),
    pool.query(pendingOrdersQuery),
    pool.query(revenueQuery),
  ]);

  return {
    total_products: totalProducts.rows[0].total_products,
    total_orders: totalOrders.rows[0].total_orders,
    total_users: totalUsers.rows[0].total_users,
    pending_orders: pendingOrders.rows[0].pending_orders,
    total_revenue: revenue.rows[0].total_revenue,
  };
};

const getBestSellingProducts = async () => {
  const query = `
    SELECT
      oi.product_id,
      oi.product_name,
      SUM(oi.quantity)::int AS total_sold,
      SUM(oi.price * oi.quantity)::numeric AS total_amount
    FROM order_items oi
    GROUP BY oi.product_id, oi.product_name
    ORDER BY total_sold DESC, total_amount DESC
    LIMIT 5
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getRecentOrders = async () => {
  const query = `
    SELECT
      id,
      customer_name,
      total_amount,
      payment_status,
      order_status,
      created_at
    FROM orders
    ORDER BY id DESC
    LIMIT 5
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getMonthlyRevenue = async () => {
  const query = `
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'MM/YYYY') AS month_label,
      COALESCE(SUM(total_amount), 0)::numeric AS revenue
    FROM orders
    WHERE order_status IN ('confirmed', 'shipping', 'completed')
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC
    LIMIT 12
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getOverviewStats,
  getBestSellingProducts,
  getRecentOrders,
  getMonthlyRevenue,
};