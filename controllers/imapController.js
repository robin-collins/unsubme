// /controllers/imapController.js
const ImapAccount = require('../models/ImapAccount');
const { fetchEmails: fetchEmailsFromService } = require('../services/imapService');
const { getEmailSettings } = require('../services/emailSettingsService');

const showAddImapAccount = (req, res) => {
  res.render('imap-info', { imapAccount: null, emailSettings: null });
};

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
      userID: req.session.userId,
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

const fetchEmails = async (req, res) => {
  try {
    const imapAccounts = await ImapAccount.find({ userID: req.session.userId });
    if (!imapAccounts || imapAccounts.length === 0) {
      return res.status(400).send('No IMAP accounts found for the user.');
    }
    for (const imapAccount of imapAccounts) {
      const imapInfo = {
        email: imapAccount.email,
        server: imapAccount.server,
        port: imapAccount.port,
        password: imapAccount.password
      };
      await fetchEmailsFromService(imapInfo, imapAccount._id);
    }
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error handling email fetching:', error.message);
    res.status(500).send(`Error fetching emails: ${error.message}`);
  }
};

const editImapAccount = async (req, res) => {
  try {
    const imapAccount = await ImapAccount.findById(req.params.id);
    if (!imapAccount) {
      return res.status(404).send('IMAP account not found');
    }
    res.render('imap-info', { imapAccount });
  } catch (error) {
    console.error('Error fetching IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  showAddImapAccount,
  addImapAccount,
  fetchEmailSettings,
  fetchEmails,
  editImapAccount
};
