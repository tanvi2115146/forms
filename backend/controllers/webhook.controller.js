const Webhook = require('../models/webhook.model');
const axios = require('axios');
const MailerLiteService = require('../service/mailerLite.service');
const mailerLite = new MailerLiteService(process.env.MAILERLITE_API_KEY);


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

    if (!data['First Name'] || !data['Email']) {
      return res.status(400).json({ error: "Missing required fields (First Name and Email)" });
    }

    try {
      const mailerLiteResponse = await mailerLite.addSubscriber(
        data['Email'],
        data['First Name'],
        process.env.MAILERLITE_GROUP_ID,
        {
          // 'name':data['Name'] || 'Tanvi',
         
          q1_title: data['Q1_Title'] || 'whats your favorite color ?',
          q1_answer: data['Q1_Answer'] || 'Black',
          q2_title: data['Q2_Title'] || 'whats the day today ?',
          q2_answer: data['Q2_Answer'] || 'Tuesday',

        }
      );
      console.log('MailerLite success:', mailerLiteResponse);
    } catch (Error) {
      console.error('MailerLite failed:', Error.response?.data || Error.message);
      
    }


    if (webhook.url) {
      const response = await axios.post(webhook.url, {
        eventType: 'lead',
        timestamp: new Date(),
        ...data 
      });
      
      console.log('Webhook success:', response.data);
    }

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

 
    const response = await axios.post(webhook.url, {
      eventType: 'visit',
      timestamp: new Date(),
      ...data
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