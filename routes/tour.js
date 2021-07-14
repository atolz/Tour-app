const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  aliasTopCheap5,
  updateTour,
  deleteTour,
  getToursStats,
  getMonthlyPlans,
  getToursWithin,
  getToursDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tour');
const reviewRouter = require('./review');
const bookingRouter = require('./booking');
const savedRouter = require('./saved');

const { protect, restrictAccessTo } = require('../controllers/auth');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/bookings', bookingRouter);
router.use('/:tourId/saved', savedRouter);

// router.param('id', isFound);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictAccessTo('admin', 'guide', 'lead-guide'), createTour);

router.route('/stats').get(getToursStats);
router.route('/top-5-cheap').get(aliasTopCheap5, getAllTours);
router
  .route('/monthly-tour-plan/:year')
  .get(
    protect,
    restrictAccessTo('admin', 'guide', 'lead-guide'),
    getMonthlyPlans
  );

//api/v1/tours/distance/:distance/center/:lat-lng/unit/:unit
router
  .route('/within/distance/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/center/:latlng/unit/:unit').get(getToursDistances);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictAccessTo('admin', 'guide', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(
    protect,
    restrictAccessTo('admin', 'guide', 'lead-guide'),
    deleteTour
  );

module.exports = router;

//Route Nesting
//tours/:id/reviews

// router
//   .route('/:tourId/reviews')
//   .get(protect, reviewsHandler.getAllReviews)
//   .post(protect, restrictAccessTo('user'), reviewsHandler.createReview);
