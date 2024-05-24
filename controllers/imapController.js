const mongoose = require('mongoose');
const ImapAccount = require('../models/ImapAccount');
const { fetchEmails: fetchEmailsFromService } = require('../services/imap');
const { getEmailSettings } = require('../services/emailSettingsService');

/**
 * Renders the Add IMAP Account page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const showAddImapAccount = (req, res) => {
  const message = req.query.message || null;
  res.render('imap-info', { imapAccount: null, emailSettings: null, message });
};

/**
 * Adds a new IMAP account.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const addImapAccount = async (req, res) => {
  try {
    const { emailAddress, imapServer, port, password, schedule } = req.body;
    const requiredFields = { emailAddress, imapServer, port, password, schedule };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`Validation error: ${field} is required.`);
        return res.status(400).send(`${field} is required.`);
      }
    }

    const imapAccount = new ImapAccount({
      userID: new mongoose.Types.ObjectId(req.session.userId), // Ensure userID is a valid ObjectId
      email: emailAddress,
      server: imapServer,
      port: parseInt(port, 10),
      password: password,
      schedule: schedule
    });
    await imapAccount.save();
    res.redirect('/imap/add-imap-account');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate email error:', error.message);
      res.status(400).send('An IMAP account with this email already exists.');
    } else {
      console.error('Error handling IMAP info submission:', error.message);
      res.status(500).send('Internal Server Error');
    }
  }
};

/**
 * Fetches email settings for the given email address.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const fetchEmailSettings = async (req, res) => {
  try {
    const { emailAddress } = req.body;
    const emailSettings = await getEmailSettings(emailAddress);
    if (!emailSettings) {
      return res.status(400).json({ error: 'Email settings not found' });
    }
    const imapSettings = emailSettings.settings.find(setting => setting.protocol === 'IMAP');
    res.json(imapSettings);
  } catch (error) {
    console.error('Error fetching email settings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Fetches emails from the IMAP server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} userId - The user ID.
 */
const fetchEmails = async (req, res, userId) => {
  try {
    const imapAccounts = await ImapAccount.find({ userID: new mongoose.Types.ObjectId(req.session.userId) }); // Ensure userID is a valid ObjectId
    if (!imapAccounts || imapAccounts.length === 0) {
      return res.redirect('/imap/add-imap-account?message=No IMAP accounts found for the user.');
    }
    for (const imapAccount of imapAccounts) {
      const imapInfo = {
        email: imapAccount.email,
        server: imapAccount.server,
        port: imapAccount.port,
        password: imapAccount.password
      };
      await fetchEmailsFromService(imapInfo, imapAccount._id, userId);
    }
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error handling email fetching:', error.message);
    res.status(500).send(`Error fetching emails: ${error.message}`);
  }
};

module.exports = {
  showAddImapAccount,
  addImapAccount,
  fetchEmailSettings,
  fetchEmails
};
