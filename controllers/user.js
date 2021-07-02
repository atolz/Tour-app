const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const handlerFactory = require('./handlersFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const name = `user-${req.user._id}-${Date.now()}.${ext}`;
//     cb(null, name);
//   },
// });
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

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  console.log('resizing.....✔✔✔💥💥💥');
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  //add to request so as to save file to disk when user data is successfully updated
  await sharp(req.file.buffer)
    .resize(500, 500, { fit: 'cover', position: 'center' })
    .toFormat('jpeg')
    .jpeg({ quality: 60 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

//set user id for the getuser, getOne factory handler
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

function filterObj(object, ...excludes) {
  excludes.forEach((el) => {
    delete object[el];
  });
  return object;
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Pls visit /signup',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('multer file', req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Pls visit the updatePassword route to update your password',
        400
      )
    );
  }
  // console.log(req.user.id);
  //vs; ...take note same ting from docucmet
  // console.log(req.user._id);

  const excludeUpdates = [
    'password',
    'passwordConfirm',
    'role',
    'changedPasswordAt',
  ];
  const update = filterObj({ ...req.body }, ...excludeUpdates);

  if (req.file) {
    update.photo = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, {
    runValidators: true,
    new: true,
  });

  // if (req.file && req.file.sharp) {
  //   req.file.sharp.toFile(`public/img/users/${req.file.filename}`);
  // }

  // console.log('update', update);
  // console.log('body', req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = handlerFactory.getOne(User, {
  path: 'bookings',
  select: '-__v',
});
exports.getAllUsers = handlerFactory.getAll(User);

//Do not update with this
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

// eslint-disable-next-line no-restricted-syntax
// for (const key in req.body) {
//   if (excludeUpdate.includes(key)) {
//     delete req.body[key];
//   }
// }

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const query = User.find();

//   const featuresApi = new APIFeatures(query, req.query)
//     .filter()
//     .sort()
//     .limitFields();

//   const users = await featuresApi.query;

//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });
