
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user_controller.js');
router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
module.exports = router;
router.get('/verify/:token',UserController.verify);