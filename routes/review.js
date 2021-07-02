const express = require('express');

const { protect, restrictAccessTo } = require('../controllers/auth');
const reviewHandler = require('../controllers/review');

const reviewRoutes = express.Router({ mergeParams: true });

////tours/:id/reviewss
reviewRoutes.use(protect);

reviewRoutes
  .route('/')
  .get(reviewHandler.getAllReviews)
  .post(
    restrictAccessTo('user'),
    reviewHandler.addTourUserIds,
    reviewHandler.createReview
  );

reviewRoutes
  .route('/:id')
  .get(reviewHandler.getReview)
  .patch(restrictAccessTo('user', 'admin'), reviewHandler.updateReview)
  .delete(restrictAccessTo('user', 'admin'), reviewHandler.deleteReview);

module.exports = reviewRoutes;
