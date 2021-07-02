const express = require('express');
const authController = require('../controllers/auth');
const bookingController = require('../controllers/booking');
const reviewHandler = require('../controllers/review');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.route('/').get(bookingController.getAllBookings).post(
  authController.restrictAccessTo('admin', 'lead-guide'),
  // reviewHandler.addTourUserIds,
  bookingController.createBooking
);

router.use(authController.restrictAccessTo('admin', 'lead-guide'));
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
