const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/me').get(authController.protect, viewController.getAccount);

router.use(authController.isLoggedIn);

router.route('/').get(viewController.getOverview);
router.route('/tour/:slug').get(viewController.getTour);
router.route('/login').get(viewController.login);

module.exports = router;
