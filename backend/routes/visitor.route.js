const express = require('express');
const router = express.Router();
const { createVisitor,submitLead} = require('../controllers/visitor.controller');


router.post('/create-visitor',createVisitor);
router.put('/submit-lead/:visitorId',submitLead)


module.exports=router;