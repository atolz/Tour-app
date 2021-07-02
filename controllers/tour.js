const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const Tour = require('../models/tour');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');
const handlerFactory = require('./handlersFactory');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }
  cb(new AppError('Not an image! Pls upload only images', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files) return next();

  //Image cover
  if (req.files.imageCover) {
    const imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(`public/img/tours/${imageCover}`);
    req.body.imageCover = imageCover;
  }

  //Tour images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, i) => {
        const image = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(`public/img/tours/${image}`);
        req.body.images.push(image);
        // console.log('sharp promise', sharpPromise);
        // return sharpPromise;
      })
    );
    // console.log(req.body.images);
  }

  next();
});

exports.aliasTopCheap5 = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  next();
};

exports.getAllTours = handlerFactory.getAll(Tour);

exports.getTour = handlerFactory.getOne(Tour, {
  path: 'reviews',
  select: '-__v',
});

exports.createTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        avgRatings: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        ratingsNum: { $sum: '$ratingsQuantity' },
      },
    },
    {
      $sort: { avgRatings: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: stats.length,
    data: stats,
  });
});

exports.getMonthlyPlans = catchAsync(async (req, res, next) => {
  // console.log('path.joint🎈🎈🎈', path.join(__dirname, '/views', 'acount.pug'));
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${+year}-01-01`),
          $lte: new Date(`${+year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        toursCount: { $sum: 1 },
        name: { $push: '$name' },
        date: { $push: '$startDates' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: plan,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  console.log('test 111');
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(distance, lat, lng, unit, radius);

  if (!lat || !lng) {
    return next(new AppError('Pls specify a lng and lat coordinate', 401));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getToursDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  console.log(lat, lng, unit);

  if (!lat || !lng) {
    return next(new AppError('Pls specify a lng and lat coordinate', 401));
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(
//       new AppError(
//         'No Tour was found with that ID: No such Tour to delete',
//         404
//       )
//     );
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // console.log(Tour.findById(req.params.id));
//   const apiFeatureQuery = new APIFeatures(
//     Tour.findById(req.params.id),
//     req.query
//   ).limitFields();
//   const tour = await apiFeatureQuery.query.populate({
//     path: 'reviews',
//     select: '-__v',
//   });

//   if (!tour) {
//     return next(new AppError('No Tour was found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
