const dashboardService = require('./dashboard.service');

const getDashboardData = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData(req.query);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
