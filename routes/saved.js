const express = require('express');
const savedController = require('../controllers/saved');
const authController = require('../controllers/auth');
const reviewController = require('../controllers/review');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);

router
  .route('/')
  .get(savedController.getAllSaved)
  .post(reviewController.addTourUserIds, savedController.createSaved)
  .delete(reviewController.addTourUserIds, savedController.deleteSavedCombined);

router
  .route('/:id')
  .get(savedController.getSaved)
  .delete(savedController.deleteSaved);

module.exports = router;
