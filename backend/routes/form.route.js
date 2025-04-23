const express = require('express');
const router = express.Router();
const { formsave } = require('../controllers/form.controller');


router.post('/',formsave);


module.exports=router;