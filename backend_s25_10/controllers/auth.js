const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generate_refresh_token = require('../helper/refresh_token')
const redisClient = require('../config/redisClient');

const jwt_refresh_expiration = 60 * 60 * 24 * 30; // 30 days  on second basis

const User = require('../models/user');


exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created!', userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
/** @type {import("express").RequestHandler} */
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }

      /** refresh token creation 
       * Then how these information can be shared with client?
      */
      let refresh_token = generate_refresh_token(64);
      let refresh_token_maxage = new Date();
      const offset = refresh_token_maxage.getSeconds() + jwt_refresh_expiration; // add defined expiration amounts to current second 
      refresh_token_maxage.setSeconds(jwt_refresh_expiration);
      // setSeconds returns original time stamp that is not reflecting the result of setSeconds
      // let refresh_token_maxage = currentDate.setSeconds(offset);
      console.log(refresh_token_maxage)

      /** access token creation */
      const accessToken = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'somesupersecretsecret',
        // { expiresIn: '1h' }
        { expiresIn: '1s' }
      );
      /** if you want to use cookie, try below */
      res.setHeader('Set-Cookie', 'test=true');
      res.cookie("access_token", accessToken, {
        // httpOnly : true,
        // secure : true
      });
      res.cookie("refresh_token", refresh_token, {
        // httpOnly : true
      });
      
      // console.log(res.set-cookie)
      // and then set redis with "refresh token" key as refresh_token,
      // and expires token as refresh_token_maxage
      redisClient.set(loadedUser._id.toString(), JSON.stringify({
        refresh_token : refresh_token,
        expiresIn : refresh_token_maxage
      }))
      res.status(200).json({ token: accessToken, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
/** @type {import("express").RequestHandler} */
exports.logout = (req, res, next) => {
  console.log('logout')
  res.clearCookie("access_token", {});
  res.clearCookie("refresh_token",{});
  res.status(200).json({ message : 'successfully logged out'});
};
