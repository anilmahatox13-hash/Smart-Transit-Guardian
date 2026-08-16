const { Route } = require('../models');

// @desc    Get all active routes
// @route   GET /api/routes
// @access  Protected
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ active: true });

    res.status(200).json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching routes.'
    });
  }
};

// @desc    Create a new route with stops
// @route   POST /api/routes
// @access  Admin only
const createRoute = async (req, res) => {
  try {
    const { name, startPoint, endPoint, stops, distanceKm, estimatedMinutes } = req.body;

    if (!name || !startPoint || !endPoint) {
      return res.status(400).json({
        success: false,
        message: 'Please provide route name, startPoint, and endPoint.'
      });
    }

    const routeExists = await Route.findOne({ name });
    if (routeExists) {
      return res.status(400).json({
        success: false,
        message: 'A route with this name already exists.'
      });
    }

    const route = await Route.create({
      name,
      startPoint,
      endPoint,
      stops: stops || [],
      distanceKm: distanceKm || 0,
      estimatedMinutes: estimatedMinutes || 0
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully.',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating route.'
    });
  }
};

// @desc    Update route details
// @route   PUT /api/routes/:id
// @access  Admin only
const updateRoute = async (req, res) => {
  try {
    let route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.'
      });
    }

    route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Route updated successfully.',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating route.'
    });
  }
};

module.exports = {
  getRoutes,
  createRoute,
  updateRoute
};
