const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let query = {};
    if (req.params.tourId) query.tour = req.params.tourId;
    const apiFeatures = new APIFeatures(Model.find(query), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError(400, 'Invalid id'));

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updateDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateDoc) return next(new AppError(400, 'Invalid id'));

    res.status(200).json({
      status: 'success',
      data: { data: updateDoc },
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(400, 'Invalid id'));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
