const path = require('path');

// const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/error');
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');
const reviewRouter = require('./routes/review');
const viewsRouter = require('./routes/views');
const bookingRouter = require('./routes/booking');

//Start express app.
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES
//Serving static files
app.use(express.static(`${__dirname}/public`));
// app.use(cors());

//Set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('indeve mode');
}

//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization againt NoSQL query injection
app.use(mongoSanitize());

//Data sanitization againt XSS attacks
app.use(xss());

//Protects againts query parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
      'name',
    ],
  })
);

//Prevents againts brute force acttacks. Excessive request from a Ip. Limit request from the same api
const limiter = rateLimit({
  windowMs: 2 * 60 * 60 * 1000,
  max: 100,
  handler: (req, res, next) => {
    next(
      new AppError(
        'You have sent to many request to the server. Pls try again later',
        429
      )
    );
  },
});
app.use('/api', limiter);

//custom middleware
app.use('/api', (req, res, next) => {
  console.log(req.query.sort);
  console.log(req.query);
  next();
});
app.use((req, res, next) => {
  // console.log('request cookies🍪', req.url, req.cookies);
  console.log('request body👀👀👀', req.body);
  next();
});

//ROUTES
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  next(
    new AppError(`Url: ${req.originalUrl} was not found on this server`, 404)
  );
});

//GLOBAL ERROR HANDLING MIDDLE WARE
app.use(globalErrorHandler);

module.exports = app;
// exports = app;
// console.log(arguments)

//---------------------------------------------------------------------
//MY MODULES
