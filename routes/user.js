const express = require('express');
const userAuth = require('../controllers/auth');
const userController = require('../controllers/user');
const bookingRouter = require('./booking');

const router = express.Router();

router.use('/:userId/bookings', bookingRouter);

router.route('/signup').post(userAuth.signUp);
router.route('/login').post(userAuth.logIn);
router.route('/logout').get(userAuth.logOut);
router.route('/forgotPassword').post(userAuth.forgotPassword);
router.route('/resetPassword/:token').patch(userAuth.resetPassword);

router.use(userAuth.protect);

router.patch('/updatePassword', userAuth.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);

router.use(userAuth.restrictAccessTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
