const { Bus, Trip, User, Emergency, Maintenance, Route } = require('../models');

// @desc    Get complete administrative fleet overview & KPIs
// @route   GET /api/analytics/overview
// @access  Admin only
const getFleetOverview = async (req, res) => {
  try {
    const [
      totalBuses,
      activeBuses,
      maintenanceBuses,
      totalDrivers,
      totalRoutes,
      activeTrips,
      openEmergencies,
      pendingMaintenance
    ] = await Promise.all([
      Bus.countDocuments(),
      Bus.countDocuments({ status: 'active' }),
      Bus.countDocuments({ status: 'maintenance' }),
      User.countDocuments({ role: 'driver' }),
      Route.countDocuments({ active: true }),
      Trip.countDocuments({ status: 'in_progress' }),
      Emergency.countDocuments({ status: { $in: ['open', 'investigating'] } }),
      Maintenance.countDocuments({ status: { $in: ['scheduled', 'in_progress'] } })
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        fleet: {
          total: totalBuses,
          active: activeBuses,
          maintenance: maintenanceBuses,
          idle: totalBuses - (activeBuses + maintenanceBuses)
        },
        personnel: {
          drivers: totalDrivers
        },
        operations: {
          activeRoutes: totalRoutes,
          liveTrips: activeTrips
        },
        safetyAndHealth: {
          activeAlerts: openEmergencies,
          pendingServices: pendingMaintenance
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error calculating fleet analytics.'
    });
  }
};

module.exports = {
  getFleetOverview
};
