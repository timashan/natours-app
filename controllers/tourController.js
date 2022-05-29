const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError(400, 'Please upload an image.', 400));
  },
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.images) return next();
  const { imageCover, images } = req.files;

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-imageCover.jpeg`;
  sharp(imageCover[0].buffer)
    .resize(1333, 2000)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    images.map(async (img, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-image-${i}.jpeg`;
      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
  select: '-_id -__v -createdAt',
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopCheap = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  next();
};

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: '$difficulty',
        nTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    stats,
  });
});

exports.monthlyStats = catchAsync(async (req, res, next) => {
  const year = req.params.year;

  const stats = await Tour.aggregate([
    {
      $match: {
        startDates: { $gt: new Date(`${year}-01-01`) },
        startDates: { $lt: new Date(`${year}-12-31`) },
      },
    },
    {
      $unwind: '$startDates',
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        nTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { nTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    stats,
  });
});

exports.toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          coordinates: [+lng, +lat],
        },
        distanceField: 'distances',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distances: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: tours },
  });
});
