const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRoutes = require('../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRoutes);

router.get(
  '/top-5-cheap',
  tourController.aliasTopCheap,
  tourController.getAllTours
);

router.get('/tour-stats', tourController.tourStats);
router.get('/monthly-plan/:year', tourController.monthlyStats);
router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.toursWithin
);
router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(tourController.deleteTour);

module.exports = router;
