const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  questionStats: [
    {
      questionTitle: String,
      isAnswered: Boolean,
      answer: String
    }
  ],
  leadForm: [
    {
      fieldName: String,
      value: String
    }
  ],
  isLead: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
