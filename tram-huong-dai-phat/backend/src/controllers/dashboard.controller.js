const dashboardRepository = require("../repositories/dashboard.repository");

const getDashboardStats = async (req, res) => {
  try {
    const [overview, bestSellingProducts, recentOrders, monthlyRevenue] =
      await Promise.all([
        dashboardRepository.getOverviewStats(),
        dashboardRepository.getBestSellingProducts(),
        dashboardRepository.getRecentOrders(),
        dashboardRepository.getMonthlyRevenue(),
      ]);

    res.status(200).json({
      message: "Lấy thống kê dashboard thành công",
      data: {
        overview,
        bestSellingProducts,
        recentOrders,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy thống kê dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};