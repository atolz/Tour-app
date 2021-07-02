const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour');
const Booking = require('../models/booking');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');
const handlerFactory = require('./handlersFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('Tour not found!', 404));

  // 2) Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}?tour=${tour._id}&price=${
      tour.price
    }&user=${req.user._id}&bookMethod=stripe`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: `${tour._id}`,
    // mode: 'payment',
    line_items: [
      {
        // price_data: {
        //   currency: 'usd',
        //   product_data: {
        //     name: tour.name,
        //   },
        //   unit_amount: tour.price,
        // },
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `https://www.natours.dev/img/tours/${tour.imageCover}`,
          `https://www.natours.dev/img/tours/${tour.images[0]}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Send checkout session
  res.status(200).json({
    status: 'success',
    checkoutSession,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // console.log('in creat bookings CHeckout🎈🧨🎈');
  const { tour, user, price, bookMethod } = req.query;
  if (!tour || !user || !price || !bookMethod) return next();

  console.log('booking🏀🥎🥎🥎.....................');
  const booking = await Booking.create({ tour, user, price, bookMethod });
  // console.log('booking🏀🥎🥎🥎', booking, req.originalUrl.split('?')[0]);
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = handlerFactory.getAll(Booking);
exports.createBooking = handlerFactory.createOne(Booking);
exports.getBooking = handlerFactory.getOne(Booking);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);
