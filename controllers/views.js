const Tour = require('../models/tour');
const User = require('../models/user');
const Booking = require('../models/booking');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');

exports.addCSPHeaders = (req, res, next) => {
  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' blob: data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com */js/bundle.js https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;connect-src 'self' https://*.stripe.com https://*.mapbox.com"
  );
  next();
};

exports.addAlert = (req, res, next) => {
  const { alert } = req.query;

  res.locals.alert = '';
  if (!alert) return next();

  if (alert === 'booking')
    res.locals.alert =
      "You have successefully booked a tour!!. Pls check your email for a confirmation. If you can't see your bookings yet, pls refresh this page or visit later";
  next();
};

exports.getOverview = catchAsync(async (req, res) => {
  // 1) get Tours from tour collection
  const tours = await Tour.find();
  // 2) build overview template
  // 3) render html
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // 1) Find bookings
  const bookings = await Booking.find({ user: req.user._id });
  // const bookedTours = bookings.map((book) => book.tour);
  const ids = bookings.map((el) => {
    // console.log('🎈🧨🧨🧧🧧el.tours.id', el.tour.id);
    // console.log('🎈🧨🧨🧧🧧el.tours', el.tour);
    return el.tour;
  });
  // console.log(ids);
  const bookedTours = await Tour.find({ _id: ids });
  // console.log(bookedTours);
  // res.status(200).json({
  //   bookings,
  //   bookedTours,
  // });
  // 2) Return booked tours
  res.status(200).render('overview', {
    title: 'My tours',
    tours: bookedTours,
  });
});

exports.getManageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('manage', {
    tours,
    title: 'Manage Tours',
  });
});
exports.getUpdateTourForm = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });

  res.status(200).render('update-tour', {
    title: `Update ${tour.name}`,
    tour,
  });
});
exports.getCreateTourForm = (req, res, next) => {
  res.status(200).render('create', {
    title: 'Create New Tour',
  });
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // console.log(tour);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  // let userHasBooked = false;
  // if (res.locals.user) {
  //   // console.log('res.locals.user🧨🎇...', res.locals.user);
  //   res.locals.user.bookings.forEach((el) => {
  //     // console.log('in for each', el.tour, tour._id);
  //     if (`${el.tour}` === `${tour._id}`) {
  //       userHasBooked = true;
  //     }
  //   });
  // }
  // console.log('....', userHasBooked, tour._id);

  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('tour', {
      title: tour.name,
      tour,
      // userHasBooked,
    });

  // res.status(200).render('tour', {
  //   title: tour.name,
  //   tour,
  // });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateMe = catchAsync(async (req, res) => {
  // console.log('URL ENCODED BODY', req.body);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, email: req.body.email },
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user,
  });
  // console.log(user);
});
