const { getEmailSettings } = require('../../services/emailSettingsService');

const fetchSmtpSettings = async (req, res) => {
  try {
    const { emailAddress } = req.body;
    const emailSettings = await getEmailSettings(emailAddress);
    if (!emailSettings) {
      return res.status(400).json({ error: 'Email settings not found' });
    }
    const smtpSettings = emailSettings.settings.find(setting => setting.protocol === 'SMTP');
    res.json(smtpSettings);
  } catch (error) {
    console.error('Error fetching email settings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  fetchSmtpSettings
};
