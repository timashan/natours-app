const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.getTourIds, reviewController.createReview);

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.uploadReview)
  .delete(reviewController.deleteReview);

module.exports = reviewRouter;
