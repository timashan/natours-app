const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION💥: shutting down...');
  process.exit(1);
});

const app = require('./app');

mongoose.connect(process.env.DATABASE_LOCAL, () =>
  console.log('Successfully conected to database!')
);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening to port ${port}`));

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTTION💥: shutting down...');
  server.close(() => process.exit(1));
});
