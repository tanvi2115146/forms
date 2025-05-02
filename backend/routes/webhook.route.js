const express = require('express');
const router = express.Router();
const { createWebhook,triggerLeadWebhook,triggerVisitWebhook,getWebhookConfig } = require( '../controllers/webhook.controller');

router.post('/create', createWebhook);
router.post('/trigger/lead', triggerLeadWebhook);
router.post('/trigger/visit', triggerVisitWebhook);
router.get('/config/:formId', getWebhookConfig);

module.exports = router;