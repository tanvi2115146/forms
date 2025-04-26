const mongoose = require('mongoose');


const formSchema = new mongoose.Schema({
  userId: String,
  formId: {
    type: String,
    unique: true,
    
  },
  fields: Array
});

module.exports = mongoose.model('Form', formSchema);
