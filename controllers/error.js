const AppError = require('../utilities/appError');

const handleDevErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      stack: err.stack,
    });
  }
  console.error('Error💥:', err);
  // if (
  //   err.message === 'Pls send a valid authorization token' ||
  //   'jwt malformed'
  // ) {
  //   return res.status(200).render('login', {
  //     title: 'Log into your account',
  //   });
  // }
  res.status(err.statusCode).render('error', {
    title: 'An error occured',
    message: err.message,
  });
};

const handleProdErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (!err.isOperational) {
      console.error('Error 💥:', err);
      err.message = 'Something went very wrong!!';
      err.statusCode = 500;
    }

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  if (!err.isOperational) {
    console.error('Error 💥:', err);
    err.message = 'Something went very wrong! Try again';
    err.statusCode = 500;
  }

  // console.error('Error💥:', err);
  res.status(200).render('error', {
    title: 'An error occured',
    message: err.message,
  });
};

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateErrorDB = (err) =>
  new AppError(`Duplicate error ${err.keyValue.name}`, 400);

const handleValidationErrorDB = (err) => new AppError(err.message, 400);
const handleTokenExpiredError = () =>
  new AppError('Token Expired. Please login again', 401);
const handleJWTError = () =>
  new AppError('Invalid token. Pls send a valid token', 401);

// -------------------------------
module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  console.log('in error mddleware', process.env.NODE_ENV);
  console.log(err);

  if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    // eslint-disable-next-line prefer-object-spread
    // let error = Object.assign(err, {});
    let error = Object.create(err);
    error.test = 'my test value';

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    // console.log('json strigify', JSON.stringify(err));
    // console.log('error...', error);
    // console.log('error...22', err);
    // console.log('error...22', error.message);
    handleProdErr(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    handleDevErr(err, req, res);
    // console.log(err);
  }
};

// console.log('error.name, ', error.name);
// console.log('err.name, ', err.name);
// console.log(error);
// console.log('err', err);
