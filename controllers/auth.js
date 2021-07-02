const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const AppError = require('../utilities/appError');
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const signJwt = require('../utilities/genJwt');
const Email = require('../utilities/sendEmail');

function sendToken(user, res, statusCode) {
  const token = signJwt(user._id);
  user.password = undefined;
  user.changedPasswordAt = undefined;

  const cookiesOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXP * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookiesOptions);

  if (process.env.NODE_ENV === 'production') {
    cookiesOptions.secure = true;
  }
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  // http://localhost:8000/me
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  sendToken(newUser, res, 201);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  //check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  //check if user email exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(password))) {
    return next(new AppError('email or password is invalid', 401));
  }

  //generate and send token
  sendToken(user, res, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  //check and find token
  // console.log(req.rateLimit);

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // console.log('token gotten from authorization Bearer');
    token = req.headers.authorization.split(' ')[1];
  }

  if (req.cookies.jwt) {
    // console.log('token gotten from cookie');
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('Pls send a valid authorization token', 401));
  }

  //verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user with this token no longer exist', 401));
  }
  // console.log(currentUser.changedPasswordAt / 1000, decoded.iat);

  //check if the user has not changed his password recently
  if (currentUser.hasChangedPassword(decoded.iat)) {
    return next(
      new AppError('You have updated your password, please login again', 401)
    );
  }
  res.locals.user = currentUser;
  req.user = currentUser;
  next();
  // if (
  //   !req.headers.authorization ||
  //   !req.headers.authorization.startsWith('Bearer')
  // ) {
  //   return next(new AppError('Pls send a valid authorization token', 401));
  // }
  // const token = req.headers.authorization.split(' ')[1];
});
exports.isLoggedIn = async (req, res, next) => {
  //This middleware is for server side rendered sites and auth token for APIs

  // 1) Check if jwt exists on cookies
  try {
    if (req.cookies.jwt) {
      //verification of the token

      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded);
      //check if the user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //check if the user has not changed his password recently
      if (currentUser.hasChangedPassword(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      // console.log(res.locals.user);
      return next();
    }
    next();
  } catch (error) {
    next();
  }
};
exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

exports.restrictAccessTo =
  (...roles) =>
  (req, res, next) => {
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Unauthorized access. You do not have permission to perfom this action',
          401
        )
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) find user with the provided password
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // console.log('dids find this usre');
    return next(new AppError('User not found. Please send a valid email', 404));
  }

  // 2)generated reset token
  const resetToken = user.generateForgotPasswordToken();
  // console.log(user);
  await user.save({ validateBeforeSave: false });

  // 3)send reset token to user email

  // const message = `Forgot password? Send a PATCH request with your new password and passwordConfirm to this url ${resetUrl}. If you didn't forget your  password pls ignore this email`;

  // const emailOptions = {
  //   email: 'timielisha333@gmail.com',
  //   subject: 'Password reset token (valid for 10minutes)',
  //   text: message,
  // };

  try {
    // await sendEmail(emailOptions);
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendResetPassword();
    res.status(200).json({
      status: 'success',
      message: 'reset token successfully sent to user email',
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was a problem sending reset email. Try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) check and get reset token
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  if (!token) {
    return next(new AppError('Please provide a valid token', 400));
  }
  const hashToken = crypto.createHash('sha256').update(token).digest('hex');
  // console.log(hashToken);

  // 2) check if user exist and get user based on token
  const user = await User.findOne({
    forgotPasswordToken: hashToken,
    forgotPasswordTokenExpiresIn: { $gt: Date.now() },
  });

  // 4) if all is fine update password
  if (!user) {
    return next(new AppError('Token inavlid or token has expired', 400));
  }
  // console.log(user);
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiresIn = undefined;
  await user.save();

  // 5) log user in, send Jwt
  sendToken(user, res, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) find user based on id
  const user = await User.findById(req.user._id).select('+password');

  // 2) check if password match
  if (!(await user.isCorrectPassword(req.body.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) if ok, change password and update at propertey
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in
  sendToken(user, res, 200);
});

// const user = await User.findByIdAndUpdate(req.user._id, req.body, {
//   new: true,
//   runValidators: true,
// }).select('+password');
// console.log(user);
