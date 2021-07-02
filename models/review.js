const mongoose = require('mongoose');
const Tour = require('./tour');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must have a tour'],
    },
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//To make sure a user can only create one review on one tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Save and Create Middleware (Document middleware)

// reviewSchema.pre('save', function () {
//   console.log('in pre save document middleware');
//   console.log(this);
//   console.log(this.tour);
// });

reviewSchema.statics.calcRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        totalRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].totalRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 1,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  const tourId = this.tour;
  this.constructor.calcRatings(tourId);
});
// reviewSchema.post('save', async function () {
//   //Get all reviews with that tourId
//   this.constructor.calcRatings();
//   const stats = await this.constructor.aggregate([
//     {
//       $match: { tour: this.tour },
//     },
//     {
//       $group: {
//         _id: '$tour',
//         totalRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//       },
//     },
//   ]);
//   console.log(this);
//   console.log(this.tour);
//   console.log(stats);

//   if (stats.length > 0) {
//     await Tour.findByIdAndUpdate(this.tour, {
//       ratingsAverage: stats[0].avgRating,
//       ratingsQuantity: stats[0].totalRating,
//     });
//   }
// });

//QUERY MIDDLEWARE

//FindByIdAndUpdate
//FindByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  const review = await this.findOne();
  this.reviewDoc = review;
  console.log('in pre query middleware', this.review);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.reviewDoc) {
    this.reviewDoc.constructor.calcRatings(this.reviewDoc.tour);
  }
});

// reviewSchema.pre(/^findOneAnd/, async function () {
//   console.log('in preee find middleware');
//   // console.log('thsi...', this);
//   this.reviewDoc = await this.findOne();
//   console.log(this.reviewDoc);
//   console.log('in preeeee and middleqare');
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   if (this.reviewDoc) {
//     // console.log(this.reviewDoc);
//     console.log('in post and middleqare', this.reviewDoc);
//     console.log(
//       'in post and middleqare----Contructor',
//       this.reviewDoc.constructor
//     );
//     const stats = await this.reviewDoc.constructor.aggregate([
//       {
//         $match: { tour: this.reviewDoc.tour },
//       },
//       {
//         $group: {
//           _id: '$tour',
//           totalRating: { $sum: 1 },
//           avgRating: { $avg: '$rating' },
//         },
//       },
//     ]);
//     console.log('Review modeel', stats, stats.length);
//     console.log('Review model lenght.....', stats.length, this.reviewDoc.tour);

//     if (stats.length > 0) {
//       await Tour.findByIdAndUpdate(this.reviewDoc.tour, {
//         ratingsAverage: stats[0].avgRating,
//         ratingsQuantity: stats[0].totalRating,
//       });
//     } else {
//       await Tour.findByIdAndUpdate(this.reviewDoc.tour, {
//         ratingsAverage: 1,
//         ratingsQuantity: 0,
//       });
//     }
//   }
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  // this.populate({ path: 'tour', select: 'name' });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
