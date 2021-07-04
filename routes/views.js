const express = require('express');
const viewsController = require('../controllers/views');
const authController = require('../controllers/auth');
// const bookingController = require('../controllers/booking');

const router = express.Router();

router.use(authController.isLoggedIn);
router.use(viewsController.addCSPHeaders);
router.use(viewsController.addAlert);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-bookings',
  // bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyBookings
);

router.post('/update-me', authController.protect, viewsController.updateMe);

module.exports = router;
