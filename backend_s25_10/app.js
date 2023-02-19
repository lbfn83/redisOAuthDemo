const path = require('path');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cookieParser = require('cookie-parser');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urle ncoded()); // x-www-form-urlencoded <form>
// app.use(cookieParser());
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));
/** @type {import("express").RequestHandler} */
// CORS manual setting without library

// var corsOptions = {
//   origin: ['http://localhost:3000'],
//   credentials: true };
// app.use(cors(corsOptions));

// app.use(cors({ credentials : true, origin: 'http://localhost:3000' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ['http://localhost:3000']);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  // This is for CORS include mode which allows to share cookie(credential) information
  res.setHeader(
    'Access-Control-Allow-Credentials', true
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
// The family option specifies the IP address family 4 to use when connecting to the MongoDB server. 
// This is because a system is prefering IPv6 over IPv4 by default.
mongoose
  .connect(
    'mongodb://localhost:27017/messages?retryWrites=true',
    {
      family: 4
    }
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
