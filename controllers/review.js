const Review = require('../models/review');
const handlerFactory = require('./handlersFactory');

exports.getAllReviews = handlerFactory.getAll(Review, {
  path: 'tour',
  select: 'name',
});

exports.addTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getReview = handlerFactory.getOne(Review);

exports.createReview = handlerFactory.createOne(Review);

exports.updateReview = handlerFactory.updateOne(Review);

exports.deleteReview = handlerFactory.deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};

//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviewsQuery = new ApiFeature(Review.find(filter), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const reviews = await reviewsQuery.query.populate({
//     path: 'tour',
//     select: 'name',
//   });
//   // console.log(reviews);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.createReview = handlerFactory.createOne(Review);

//create review on tour middleware
