const Saved = require('../models/saved');
const handlerFactory = require('./handlersFactory');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.createSaved = handlerFactory.createOne(Saved);
exports.getAllSaved = handlerFactory.getAll(Saved);
exports.getSaved = handlerFactory.getOne(Saved);
exports.deleteSaved = handlerFactory.deleteOne(Saved);

// exports.hasSaved = catchAsync(async (req, res, next) => {
//   const saved = await Saved.findOne({
//     tour: req.body.tourId,
//     user: req.user._id,
//   });

//   console.log('User saved is', saved);

//   res.status(200).json({
//     status: 'success',
//     saved,
//   });
// });

exports.deleteSavedCombined = catchAsync(async (req, res, next) => {
  const saved = await Saved.deleteMany(req.body);
  // console.log('saved is...🧨💥🧧', saved);

  //would never run caz saved is an object but not a document
  //{ n:   1, ok: 1, deletedCount: 1 }
  if (!saved) {
    return next(
      new AppError(
        'No document was found with that ID: No such Document to delete',
        404
      )
    );
  }

  res.status(204).json(null);
});
