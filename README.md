# Members Only

A simple app for learning/practicing bcrypt, passport authentication with session, express, mongoose.

-----

[Helpful Article](https://levelup.gitconnected.com/everything-you-need-to-know-about-the-passport-local-passport-js-strategy-633bbab6195)

[odin authentication tutorial](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs/lessons/authentication-basics)

[passport docs](http://www.passportjs.org/docs/downloads/html/)

[luxon library](https://moment.github.io/luxon/#/?id=luxon): For formatting/ manipulating date/time. Moment alternative.

-----

## Notes

### Create skeleton project:

    $ npx express-generator –view=pug <project-name>

### Start app with debug:

    $ DEBUG=members-only:* npm start

### Create .gitignore and .env

    $ npm install dotenv

    require('dotenv').config();

Put mongoose connection string in the .env.

Write node_modules and .env in the gitignore (on seperate lines)

### Setup mongoose

    $ npm install mongoose


### Create Models

Create models directory and a file for each model, User, Message

### Create sign up form

1. route to get form.
2. controller for the route.
3. a view for the form.
4. route to post the form.
5. controller for the post route.

**Install express-validator**

    $ npm install express-validator

Used for validating and sanitizing the form data.

**Install bcryptjs**

This is for hashing passwords

    $ npm install bcryptjs


## Passport Setup

**Install passport and passport-local**

    $ npm install passport passport-local

**Install [express-session](https://www.npmjs.com/package/express-session)**

This is used by passport

    $ npm install express-session

### This is what I added to app.js

Although there is other code between some of these.

```
/// Passport dependencies ///
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/// AUTHENTICATION ///

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      // Using bcrypt to check hashed password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user)
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
      })
    });
  })
);

// These two are only needed when using sessions:
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/// The following middleware needed when using passport with sessions ///
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

/* Allows access to the currentUser variable in all your views,
you won't have to manually pass it into all the controllers. */
// app.use(function(req, res, next) {
//   res.locals.currentUser = req.user;
//   next();
// });
```

-----

## TROUBLE SHOOTING

### The passport.use() method expects your POST request to have the following fields:

```
{
  'username': 'sample@email.com',
  'password': 'sample_password'
}
```

If your post request contained...

```
{
  'email': 'sample@email.com',
  'pw': 'sample_password'
}
```

It will not work. But you can supply passport.use() with field definitions:

```
passport.use(  {
    usernameField: 'email',
    passwordField: 'pw'
  },
  function (email, password, callback) {    // Implement your callback function here  });
```
-----

### How to access user data (in database) from within pug views?

I put the following just before the `app.use('/', indexRouter);` **in app.js**:

```
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
```
This allows access to the user data with the variable currentUser in any pug view.

-----
### Messages in the localStrategy callback

A flash message is a message that displays just for the current page load, ie. if you refresh the page, the message won't load again until it is triggered.

These messages (in **app.js**) are displayed using the options in the **passport.authenticate()** function, add a failureFlash option, like so:

```
app.post('/login',
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
  })
);
```
**NOTE:** Using flash messages requires a **req.flash()** function. Express 2 provided this, but was removed for later versions. Use of [connect-flash](https://github.com/jaredhanson/connect-flash) middleware is recommended to provide this functionality.

    $ npm install connect-flash

    var flash = require('connect-flash');

    app.use(flash());

And finally add the following to the **failureRedirect** route:

```
  res.render('signin_form', {
    message: req.flash('error')
  });
```
In the `signin_form` view the variable `message` will contain the failure message from passport (or it will be undefined).

-----
### Bootstrap anchor button

    <a href='/new-message' class="btn btn-primary">New message</a>

Or for pug

    a.btn.btn-sucess(href='/new-message') New message

