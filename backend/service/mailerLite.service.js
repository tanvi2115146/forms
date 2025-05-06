const axios = require('axios');

class MailerLiteService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.mailerlite.com/api/v2';
  }

  async addSubscriber(email, name, groupId, fields = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/subscribers`,
        {
          email,
          fields,
          groups: [groupId]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-MailerLite-ApiKey': this.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('MailerLite error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = MailerLiteService;