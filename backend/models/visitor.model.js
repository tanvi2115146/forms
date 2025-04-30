const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  formId: String,
  isLeadForm: Boolean,
  questionStats: [
    {
      question: String,
      answer: Boolean,
      answerText: String,
    }
  ],
  leadForm: [
    {
      data: Object
    }
  ]
});

module.exports = mongoose.model('Visitor', visitorSchema);
