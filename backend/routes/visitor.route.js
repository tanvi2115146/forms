const express = require('express');
const router = express.Router();
const { createVisitor,submitLead,updateQuestionStats} = require('../controllers/visitor.controller');


router.post('/create-visitor',createVisitor);

router.put('/submit-lead/:visitorId',submitLead)
router.patch('/update-question/:visitorId',updateQuestionStats)

module.exports=router;