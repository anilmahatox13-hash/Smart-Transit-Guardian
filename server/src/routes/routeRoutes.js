const express = require('express');
const router = express.Router();
const { getRoutes, createRoute, updateRoute } = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getRoutes)
  .post(protect, authorize('admin'), createRoute);

router.route('/:id')
  .put(protect, authorize('admin'), updateRoute);

module.exports = router;
