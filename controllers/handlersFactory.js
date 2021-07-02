const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const APIFeatures = require('../utilities/apiFeatures');

exports.getAll = (Model, popOption) =>
  catchAsync(async (req, res) => {
    //FILTER
    //SORT
    //LIMITFIELDS
    //PAGINATION

    //To allow for nested GET reviews on tour
    //For reviews i.e /tours/:id/reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    if (req.params.userId) filter = { user: req.params.userId };

    const query = Model.find(filter);
    if (popOption) {
      console.log('in pop options');
      query.populate(popOption);
    }
    const featuresApi = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    //ACTUALL RESULT
    // const doc = await featuresApi.query.explain(); //toObject for virtual properties
    const doc = await featuresApi.query; //toObject for virtual properties
    // console.log(doc);

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc, //toJSON is called here i think virtuals
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    // if (!req.params.id) {
    //   req.params.id = req.user.id;
    // }
    const docQuery = Model.findById(req.params.id);

    if (popOption) {
      docQuery.populate(popOption);
      console.log('🧨🧨🧨🎇🎆🎆🎆pop options', popOption);
    }

    const apiFeatureQuery = new APIFeatures(docQuery, req.query).limitFields();

    const doc = await apiFeatureQuery.query;

    if (!doc) {
      return next(new AppError('No document was found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // eslint-disable-next-line prettier/prettier
    if (req.body.password) {
      delete req.body.password;
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No Document was found with that ID', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          'No document was found with that ID: No such Document to delete',
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
