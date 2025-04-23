
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { register, login } = require('../controllers/user.Controller');




router.post('/signup', register);

router.post('/login',login);

module.exports = router;
