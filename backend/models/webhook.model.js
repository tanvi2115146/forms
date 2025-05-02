const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  formId: { type: String, required: true },
  url: { type: String, required: true },
  secret: { type: String },
  events: {
    lead: { type: Boolean, default: true },
    visit: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Webhook', webhookSchema);