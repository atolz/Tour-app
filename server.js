const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💥💥 Shutting down...');
  console.log(err.name, '...Message:', err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

let DB = process.env.DATABASE_LOCAL;
if (process.env.NODE_ENV !== 'development') {
  // console.log('remote database in use');
  DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
  );
}

const start = Date.now();
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('connection successful!!✔✔🚀');
    console.log(`It took ${Date.now() - start} to connect to db`);
    if (process.env.NODE_ENV !== 'development')
      console.log('remote database in use');
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 💥💥 Shutting down...');
  console.log(err.name, '...Message:', err.message);
  server.close(() => {
    console.log('closing server💥');
    process.exit(1);
  });
});
