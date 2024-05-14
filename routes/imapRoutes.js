const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { fetchEmails } = require('../services/imapService');
const router = express.Router();
const ImapAccount = require('../models/ImapAccount');

router.get('/add-imap-account', isAuthenticated, (req, res) => {
  res.render('imap-info');
});

router.post('/imap-info', isAuthenticated, async (req, res) => {
  try {
    const { emailAddress, imapServer, port, password } = req.body;
    const requiredFields = { emailAddress, imapServer, port, password };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`Validation error: ${field} is required.`);
        return res.status(400).send(`${field} is required.`);
      }
    }

    // Save IMAP account details to the database
    const imapAccount = new ImapAccount({
      userID: req.session.userId, // Assuming `req.session.userId` contains the authenticated user ID
      email: emailAddress,
      server: imapServer,
      port: parseInt(port, 10),
      password: password,
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
      console.log(imapInfo);
      await fetchEmails(imapInfo, imapAccount._id); // Pass the accountID
    }

    res.send('Emails fetched and stored successfully.');
  } catch (error) {
    console.error('Error handling email fetching:', error.message);
    console.error(error.stack);
    res.status(500).send(`Error fetching emails: ${error.message}`);
  }
});

module.exports = router;
