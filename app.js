const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSantize = require('express-mongo-sanitize');
const { default: rateLimiter } = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.enable('trust proxy');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(`${__dirname}`, 'views'));

app.use(compression());

app.use(
  helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })
);
app.use(xss());
app.use(mongoSantize());
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  })
);

const limiter = rateLimiter({
  max: 100,
  windowMs: 1000 * 60 * 60,
  message: 'Your limit exceeded. Try again after a hour!',
});
app.use(limiter);

const morgan = require('morgan');
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(404, `${req.originalUrl} cannot be found on the server!`));
});

app.use(errorController);

module.exports = app;
