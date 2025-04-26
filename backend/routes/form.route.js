const express = require('express');
const router = express.Router();
const { createForm,saveForm, getFormsByUserId ,getFormByFormId} = require('../controllers/form.controller');

router.post('/createform',createForm)
router.post('/save', saveForm);
router.get('/getforms/:userId', getFormsByUserId);

router.get('/getform/:formId', getFormByFormId);
router.get('/particular-form/:formId', getFormByFormId);

module.exports=router;