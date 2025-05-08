

const Webhook = require('../models/webhook.model');
const axios = require('axios');
const MailerLiteService = require('../service/mailerLite.service');
const Visitor = require('../models/visitor.model'); // Add this import

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
    if (!webhook) {
      return res.status(404).json({ error: "Webhook configuration not found for this form" });
    }
    
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
      try {
        const response = await axios.post(webhook.url, {
          eventType: 'lead',
          timestamp: new Date(),
          ...data 
        });
        
        console.log('Webhook success:', response.data);
      } catch (webhookError) {
        console.error('Error sending to webhook URL:', webhookError.message);
       
      }
    }

    
    if (data.visitorId) {
      try {
        const visitorUpdateResult = await Visitor.updateOne(
          { _id: data.visitorId, "questionStats.fieldType": "lead" },
          {
            $set: {
              "questionStats.$.answer": true,
              "questionStats.$.answerText": JSON.stringify(data)
            }
          }
        );
        console.log('Updated visitor lead status:', visitorUpdateResult);
      } catch (visitorError) {
        console.error('Error updating visitor lead status:', visitorError);
   
      }
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

   
    let leadSubmissions = [];
    
    if (Array.isArray(data)) {
      leadSubmissions = data
        .filter(item => item.fieldType === 'lead' && item.answerText)
        .map(item => {
          try {
            return JSON.parse(item.answerText);
          } catch (e) {
            console.error('Error parsing lead data:', e);
            return null;
          }
        })
        .filter(leadData => leadData && leadData['Email'] && leadData['First Name']);
    }


    if (leadSubmissions.length > 0) {
      const leadData = leadSubmissions[0];
      console.log('Processing lead data:', leadData);

      try {
        const mailerLiteResponse = await mailerLite.addSubscriber(
          leadData['Email'],
          leadData['First Name'],
          process.env.MAILERLITE_GROUP_ID,
          {
            q1_title: leadData['Q1_Title'] || 'Default Question 1',
            q1_answer: leadData['Q1_Answer'] || '',
            q2_title: leadData['Q2_Title'] || 'Default Question 2',
            q2_answer: leadData['Q2_Answer'] || ''
           
          }
        );
        console.log('MailerLite subscriber added:', mailerLiteResponse);
      } catch (mailerError) {
        console.error('MailerLite error:', mailerError.response?.data || mailerError.message);
      }
    }

    // Send to configured webhook URL if exists
    if (webhook.url) {
      try {
        const response = await axios.post(webhook.url, {
          eventType: 'visit',
          timestamp: new Date(),
          ...data,
          leadData: leadSubmissions[0] || null
        });

        res.json({ 
          success: true,
          message: 'Visit webhook triggered successfully',
          url: webhook.url,
          response: response.data
        });
      } catch (webhookError) {
        console.error('Error sending to webhook URL:', webhookError);
        res.status(500).json({
          error: "Failed to send data to webhook URL",
          details: webhookError.message
        });
      }
    } else {
      res.json({ 
        success: true,
        message: 'Visit processed (no webhook URL configured)'
      });
    }
    
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
    res.json(webhook || { url: '', events: { lead: false, visit: true } });
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