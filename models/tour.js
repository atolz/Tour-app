const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./user');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      minlength: [10, 'Tour name length cannot be less than 10 characters'],
      maxlength: [
        30,
        'Tour name length must not be less more than 30 characters',
      ],
    },
    slug: String,
    saves: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Diffuculty level must be either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings cannot be less than 1'],
      max: [5, 'Ratings average cannot be more than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // validate: {
      //   validator: function (val) {
      //     return val < this.price;
      //   },
      //   message: `Discount price ({VALUE}) should be below regular price...`,
      // },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ duration: 1, price: -1 });
// tourSchema.index({ duration: 1 });
// tourSchema.index({ price: -1 });

//VIRTUAL PROPERTY MIDDLEWARES
tourSchema.virtual('weeksDuration').get(function () {
  // console.log('in virtual property');
  if (this.duration < 7) {
    return `${this.duration}days`;
  }
  const weeks = parseInt(this.duration / 7, 10);
  const days = this.duration % 7;
  return `${weeks}week(s) ${days}day(s)`;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.virtual('allSaves', {
  ref: 'Saved',
  foreignField: 'tour',
  localField: '_id',
});

// tourSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'rating',
//   localField: 'ratingsAverage',
// });

//Middleware/hook ONLY FOR save() and create()
//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  // console.log('pre save middleware');
  this.slug = slugify(this.name);
  next();
});

// tourSchema.pre('save', async function (next) {
//   // console.log('in embed user guide middleware');
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// tourSchema.pre('save', function (next) {
//   console.log('in embed user guide middleware');
//   const guidesPromises = this.guides.map((id) => mongoose.Types.ObjectId(id));

//   this.guides = guidesPromises;
//   next();
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.startTime = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v' });
  // this.select('+price');
  // this.select('-price');
  // this.select('-guides');
  // this.select('-guides -duration');
  // this.populate('reviews');
  next();
});

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(
//     `Query middleware took ${(Date.now() - this.startTime) / 1000}seconds`
//   );
//   next();
// });

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: { $ne: true },
//     },
//   });
//   // console.log(this.pipeline());
//   next();
// });

module.exports = mongoose.model('Tour', tourSchema, 'tours');
