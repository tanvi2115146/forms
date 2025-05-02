

const Webhook = require('../models/webhook.model');
const axios = require('axios');


const createWebhook = async (req, res) => {
  try {
    const { formId, url, events } = req.body;
    const webhook = await Webhook.findOneAndUpdate(
      { formId },
      { url, events: events || { lead: true, visit: true } }, 
      { upsert: true, new: true }
    );
    res.status(201).json(webhook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




const triggerLeadWebhook = async (req, res) => {
  try {
    const { formId, data } = req.body;
    
    console.log('Received REAL lead data:', data); 
    
    const webhook = await Webhook.findOne({ formId });
    if (!webhook?.events?.lead) {
      return res.status(400).json({ error: "Lead webhook not enabled" });
    }

    // Verify data structure
    if (!data['First Name'] || !data['Email']) {
      console.warn('Incomplete lead data received:', data);
    }

    const response = await axios.post(webhook.url, {
      eventType: 'lead',
      timestamp: new Date(),
      data 
    });
    
    res.json({ 
      success: true,
      sentData: data 
    });
    
  } catch (err) {
    console.error('Lead webhook error:', err);
    res.status(500).json({ 
      error: err.message,
      receivedData: req.body.data 
    });
  }
};





const triggerVisitWebhook = async (req, res) => {
  try {
    const { formId, data } = req.body;
    console.log('Visit webhook triggered with data:', data);
    
    const webhook = await Webhook.findOne({ formId });
    
    if (!webhook) {
      return res.status(404).json({ error: "Webhook configuration not found" });
    }
    
    if (!webhook.events.visit) {
      return res.status(400).json({ error: "Visit webhook not enabled" });
    }
    
    if (!webhook.url) {
      return res.status(400).json({ error: "Webhook URL not configured" });
    }

    // Actually send data to the webhook URL
    const response = await axios.post(webhook.url, {
      eventType: 'visit',
      timestamp: new Date(),
      data
    });

    res.json({ 
      success: true,
      message: 'Visit webhook triggered successfully',
      url: webhook.url,
      response: response.data
    });
    
  } catch (err) {
    console.error('Error triggering visit webhook:', err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};


const getWebhookConfig = async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ formId: req.params.formId });
    res.json(webhook || { url: '', events: { lead: true, visit: true } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createWebhook,
  triggerLeadWebhook,
  triggerVisitWebhook,
  getWebhookConfig
};