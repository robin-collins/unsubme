// /routes/imapRoutes.js
const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { fetchEmails } = require('../services/imapService');
const { getEmailSettings } = require('../services/emailSettingsService');
const router = express.Router();
const ImapAccount = require('../models/ImapAccount');

router.get('/add-imap-account', isAuthenticated, (req, res) => {
  res.render('imap-info', { emailSettings: null });
});

router.post('/imap-info', isAuthenticated, async (req, res) => {
  try {
    const { emailAddress, imapServer, port, password, schedule } = req.body;
    const requiredFields = { emailAddress, imapServer, port, password, schedule };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`Validation error: ${field} is required.`);
        return res.status(400).send(`${field} is required.`);
      }
    }

    // Save IMAP account details to the database
    const imapAccount = new ImapAccount({
      userID: req.session.userId,
      email: emailAddress,
      server: imapServer,
      port: parseInt(port, 10),
      password: password,
      schedule: schedule, // Save the schedule
    });

    const savedImapAccount = await imapAccount.save();
    console.log('IMAP account saved to database: ', emailAddress);
    res.redirect('/imap/add-imap-account');
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      console.error('Duplicate email error:', error.message);
      res.status(400).send('An IMAP account with this email already exists.');
    } else {
      console.error('Error handling IMAP info submission:', error.message);
      console.error(error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
});

router.post('/fetch-email-settings', isAuthenticated, async (req, res) => {
  try {
    const { emailAddress } = req.body;
    console.log(`Received request to fetch settings for: ${emailAddress}`);

    const emailSettings = await getEmailSettings(emailAddress);

    if (!emailSettings) {
      return res.status(400).json({ error: 'Email settings not found' });
    }

    const imapSettings = emailSettings.settings.find(setting => setting.protocol === 'IMAP');
    console.log('Fetched IMAP settings:', imapSettings);

    res.json(imapSettings);
  } catch (error) {
    console.error('Error fetching email settings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/fetch-emails', isAuthenticated, async (req, res) => {
  try {
    // Find all IMAP accounts linked to the authenticated user
    const imapAccounts = await ImapAccount.find({ userID: req.session.userId });
    if (!imapAccounts || imapAccounts.length === 0) {
      return res.status(400).send('No IMAP accounts found for the user.');
    }

    // Loop over each IMAP account and submit details to fetchEmails function
    for (const imapAccount of imapAccounts) {
      const imapInfo = {
        email: imapAccount.email,
        server: imapAccount.server,
        port: imapAccount.port,
        password: imapAccount.password
      };
      console.log("Fetching email for account: ", imapInfo.email);
      await fetchEmails(imapInfo, imapAccount._id); // Pass the accountID
    }

    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error handling email fetching:', error.message);
    console.error(error.stack);
    res.status(500).send(`Error fetching emails: ${error.message}`);
  }
});
module.exports = router;
