const express = require('express');
const viewsController = require('../controllers/views');
const authController = require('../controllers/auth');
const bookingController = require('../controllers/booking');

const router = express.Router();

router.use(authController.isLoggedIn);
router.use(viewsController.addCSPHeaders);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-bookings',
  authController.protect,
  viewsController.getMyBookings
);

router.post('/update-me', authController.protect, viewsController.updateMe);

module.exports = router;
