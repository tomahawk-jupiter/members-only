const User = require('../models/user');
const Message = require('../models/message');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');


// GET home page and display messages
exports.index = function(req, res, next) {
  Message.find({}, (err, messages) => {
    if (err) { return next(err); }

    if (messages.length > 0) {
      res.render('index', {
        messages: messages
      });
    } else {
      res.render('index');
    }
  })
}


// GET signup form
exports.signup_form_get = function(req, res) {
  res.render('signup_form');
}


// POST signup form
exports.signup_form_post = [
  // Validate and sanitize form data
  body('firstname', 'First name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('lastname', 'Last name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('username', 'Username must not be empty').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password must not be empty').trim().isLength({ min: 1}).escape(),
  body('confirmation', 'Passwords must match')
    .trim()
    .isLength({ min: 1})
    .escape()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {
    const errors = validationResult(req);
    const password = req.body.password;

    // Verify admin user
    let isAdmin = false;
    let isMember = false;
    if (req.body.admin === 'on' && req.body.adminpw === 'admin') {
      isAdmin = true;
      isMember = true;
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) { return next(err); }

      const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: hashedPassword,
        admin: isAdmin,
        member: isMember
      });

      if (!errors.isEmpty()) {
        // There are validation errors
        res.render('signup_form', {
          user: user,
          errors: errors.array()
        });
      } else {
        // Form data valid, check if user exists
        User.find({ username: req.body.username }, (err, userDocs) => {
          if (err) { return next(err); }
  
          if (userDocs.length > 0) {
            // User exists in db, send form back
            res.render('signup_form', {
              user: user,
              error: 'This username already exists'
            });
          } else {
            // User isn't in db so save.
            user.save((err) => {
              if (err) { return next(err); }
              // Successful, redirect to signin
              res.redirect('/sign-in');
            });
          }
        });
      }
    });
  }
]


// GET sign in form
exports.signin_form_get = function(req, res) {
  res.render('signin_form', {
    message: req.flash('error')
  });
}


// POST sign in form, authenticate
exports.signin_form_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/sign-in',
  failureFlash: true
});


// GET join club form
exports.join_club_get = function(req, res) {
  res.render('join_club');
}


// POST join club form
exports.join_club_post = function(req, res, next) {
  const memberPW = 'please';
  if (req.body.memberPW === memberPW) {
    User.findByIdAndUpdate(req.body.userID, { member: true }, (err) =>{
      if (err) { return next(err); }
      res.redirect('/');
    });
  } else {
    res.render('join_club', { error: 'Sorry, thats not quite right!'});
  }
}


exports.message_form_get = function(req, res, next) {
  res.render('new_message');
};


exports.message_form_post = [
  body('title', 'Message Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('text', 'Message Text must not be empty').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      author: req.body.author
    });

    if (!errors.isEmpty()) {
      console.log(errors.array());
      res.render('new_message', {
        errors: errors.array(),
      });
    } else {
      message.save((err) => {
        if (err) { return next(err); }

        res.redirect('/');
      });
    }
  }
]

exports.delete_message = function(req, res, next) {
  Message.findOneAndDelete(req.body.messageID, (err) => {
    if (err) { return next(err); }

    res.redirect('/');
  });
}