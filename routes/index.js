const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

/* GET home page. */
router.get('/', user_controller.index);

// GET Sign up form
router.get('/sign-up', user_controller.signup_form_get); 

// POST sign up form
router.post('/sign-up', user_controller.signup_form_post);

// GET sign in form
router.get('/sign-in', user_controller.signin_form_get);

// POST sign in form
router.post('/sign-in', user_controller.signin_form_post);

// Signout
router.get('/sign-out', (req, res) => {
  req.logout();
  res.redirect('/');
});

// GET join club
router.get('/join-club', user_controller.join_club_get);

//POST join club
router.post('/join-club', user_controller.join_club_post);

// GET new message form
router.get('/new-message', user_controller.message_form_get);

// POST new message form
router.post('/new-message', user_controller.message_form_post);

// Delete message
router.get('/delete-message', user_controller.delete_message);

module.exports = router;
