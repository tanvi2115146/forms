

const mongoose = require('mongoose');

const questionStatSchema = new mongoose.Schema({
  questionId: { type: String, required: true }, 
  question: { type: String, required: true },
  answer: { type: Boolean, default: false },
  answerText: { type: String, default: '' },
  fieldType: { type: String, required: true } 
}, { _id: true }); 

const visitorSchema = new mongoose.Schema({
  formId: { type: String, required: true },
  isLeadForm: { type: Boolean, default: false },
  questionStats: [questionStatSchema], 
  leadForm: [{
    data: Object
  }]
});

module.exports = mongoose.model('Visitor', visitorSchema);