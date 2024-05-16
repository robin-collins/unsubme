// services/emailSettingsService.js
const axios = require('axios');

const getEmailSettings = async (email) => {
  try {
    const response = await axios.get(`https://emailsettings.firetrust.com/settings?q=${email}`);
    console.log('Email settings response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching email settings:', error);
    throw new Error('Unable to fetch email settings');
  }
};

module.exports = {
  getEmailSettings,
};
