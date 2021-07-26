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
//notice that this route is '/'...so using a middleware globbally in this route affects other outer routes eg /login
// router.use(authController.protect, authController.restrictAccessTo('admin'));

// router.use(
//   /update*/,
//   authController.protect,
//   authController.restrictAccessTo('adm')
// );

router.get(
  '/manage-tours',
  authController.protect,
  authController.restrictAccessTo('admin'),
  viewsController.getManageTours
);
router.get(
  '/update-tour/:slug',
  authController.protect,
  authController.restrictAccessTo('admin'),
  viewsController.getUpdateTourForm
);
router.get(
  '/create-tour',
  authController.protect,
  authController.restrictAccessTo('admin'),
  viewsController.getCreateTourForm
);

router.post('/update-me', viewsController.updateMe);

module.exports = router;
