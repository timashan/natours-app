const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const Email = require('../utils/email');
const crypto = require('crypto');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, req, res, statusCode) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * process.env.COOKIE_EXPIRES_IN
    ),
    httpOnly: true,
    secure:
      process.env.NODE_ENV === 'development'
        ? 'false'
        : req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { data: user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });

  await new Email(
    user,
    `${req.protocol}://${req.get('host')}/me`
  ).sendWelcome();

  createSendToken(user, req, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError(400, 'Please enter email and password!'));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.verifyPassword(password))
    return next(new AppError(400, 'Incorrect username or password!'));

  createSendToken(user, req, res, 200);
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) return next();

    if (user.hasPasswordChanged(decoded.iat)) return next();

    res.locals.user = user;
  }

  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers['authorization'] &&
    req.headers['authorization'].startsWith('Bearer')
  )
    token = req.headers['authorization'].split(' ')[1];
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError(401, 'You are not logged in!'));

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const user = await User.findById(decoded.id).select('+password');

  if (!user)
    return next(new AppError(401, 'No user found belonging to that token!'));

  if (user.hasPasswordChanged(decoded.iat))
    return next(new AppError(401, 'Passoword has recently changed!'));

  req.user = user;
  res.locals.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(403, "You don't have permission to perform this action!")
      );
    next();
  };
};

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm)
    return next(
      new AppError(
        400,
        'passwordCurrent, password, passwordConfirm are required!'
      )
    );

  const user = req.user;
  if (!(await user.verifyPassword(passwordCurrent)))
    return next(new AppError(401, 'Incorrect password.'));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, req, res, 200);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email)
    return next(new AppError(400, 'Please enter your email.'));

  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError(400, 'No user found with that email!'));

  const token = user.createPwdResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(
      user,
      `${req.protocol}://${req.get('host')}/resetPassword/${token}`
    ).sendPwdResetToken();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    return new AppError(500, 'Somehting went wrong. Try again later!');
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    return next(new AppError(400, 'Please specify password & passwordConfirm'));

  const hashed = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) return next(new AppError(401, 'Token invalid or expired'));

  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, res, res, 200);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 1000) });

  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out',
  });
});
