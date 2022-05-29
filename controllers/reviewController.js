const factory = require('../controllers/handlerFactory');
const Review = require('../models/reviewModel');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.uploadReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

exports.getTourIds = (req, res, next) => {
  req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};
