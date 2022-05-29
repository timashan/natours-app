const AppError = require('../utils/appError');

const sendDevError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      err: err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).render('error', {
    message: err.message,
  });
};

const sendProdError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    return res.status(err.statusCode).json({
      status: 500,
      message: 'Something went very wrong!',
    });
  }

  // if (err.message.startsWith('Token'))
  //   return res.status(err.statusCode).render('login', {
  //     title: 'Natours | Login',
  //   });

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      message: err.message,
    });
  }

  return res.status(err.statusCode).render('error', {
    message: 'Something went wrong! Please try again later.',
  });
};

const handleCastError = err => new AppError(400, `Invalid id: ${err.value}`);
const handleDuplicateFieldError = err =>
  new AppError(400, `Duplicate values: ${Object.values(err.keyValue)}`);
const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(400, errors.join('. '));
};
const handleJWTError = err => new AppError(401, 'Token invalid');
const handleJWTExpiredError = err => new AppError(401, 'Token expired');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendDevError(err, req, res);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateFieldError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
    sendProdError(error, req, res);
  }
};
