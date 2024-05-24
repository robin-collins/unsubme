const axios = require('axios');

/**
 * Fetches email settings for the given email address.
 * @param {string} email - The email address to fetch settings for.
 * @returns {Promise<Object>} The email settings.
 */
const getEmailSettings = async (email) => {
  try {
    const response = await axios.get(`https://emailsettings.firetrust.com/settings?q=${email}`);
    console.log('Email settings response:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 error specifically
      console.log(`Email settings not found for ${email}`);
      return null; // Return null or an empty object based on your requirement
    } else {
      // Log other types of errors
      console.error('Error fetching email settings:', error);
      throw new Error('Unable to fetch email settings');
    }
  }
};

module.exports = {
  getEmailSettings,
};
