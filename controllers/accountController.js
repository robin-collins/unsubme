const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const ImapAccount = require('../models/ImapAccount');
const SmtpAccount = require('../models/SmtpAccount');
const { getEmailSettings } = require('../services/emailSettingsService');

const manageAccount = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const imapAccounts = await ImapAccount.find({ userID: req.session.userId });
    const smtpAccounts = await SmtpAccount.find({ userID: req.session.userId });
    res.render('manage-account', { user, imapAccounts, smtpAccounts });
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).send('Internal Server Error');
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send('New passwords do not match');
    }
    const user = await User.findById(req.session.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('Current password is incorrect');
    }
    user.password = newPassword; // Set the new password directly
    await user.save(); // The pre('save') middleware will hash the new password
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send('Internal Server Error');
  }
};

const deleteImapAccount = async (req, res) => {
  try {
    await ImapAccount.findByIdAndDelete(req.params.id);
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error deleting IMAP account:', error);
    res.status(500).send('Internal Server Error');
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

const updateImapAccount = async (req, res) => {
  try {
    const { emailAddress, imapServer, port, password, schedule } = req.body;
    const imapAccount = await ImapAccount.findById(req.params.id);
    if (!imapAccount) {
      return res.status(404).send('IMAP account not found');
    }
    imapAccount.email = emailAddress;
    imapAccount.server = imapServer;
    imapAccount.port = parseInt(port, 10);
    imapAccount.schedule = schedule;
    if (password) {
      imapAccount.password = password;
    }
    await imapAccount.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error updating IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const addSmtpAccount = async (req, res) => {
  try {
    const smtpAccount = await SmtpAccount.findOne({ _id: req.params.id, userID: req.session.userId });
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('smtp-info', { smtpAccount, userEmail: user.email });
  } catch (error) {
    console.error('Error fetching SMTP account:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const createSmtpAccount = async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;
    const smtpAccount = new SmtpAccount({
      userID: req.session.userId,
      email: emailAddress,
      username: username,
      server: smtpServer,
      port: parseInt(port, 10),
      password: password,
      encryption: encryption,
    });
    await smtpAccount.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error adding SMTP account:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const editSmtpAccount = async (req, res) => {
  try {
    const smtpAccount = await SmtpAccount.findById(req.params.id);
    if (!smtpAccount) {
      return res.status(404).send('SMTP account not found');
    }
    res.render('smtp-info', { smtpAccount, userEmail: smtpAccount.email });
  } catch (error) {
    console.error('Error fetching SMTP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateSmtpAccount = async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;
    const smtpAccount = await SmtpAccount.findById(req.params.id);
    if (!smtpAccount) {
      return res.status(404).send('SMTP account not found');
    }
    smtpAccount.email = emailAddress;
    smtpAccount.username = username;
    smtpAccount.server = smtpServer;
    smtpAccount.port = parseInt(port, 10);
    smtpAccount.encryption = encryption;
    if (password) {
      smtpAccount.password = password;
    }
    await smtpAccount.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error updating SMTP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const deleteSmtpAccount = async (req, res) => {
  try {
    await SmtpAccount.findByIdAndDelete(req.params.id);
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error deleting SMTP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

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

const testSmtp = async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: parseInt(port, 10),
      secure: encryption === 'SSL',
      auth: { user: username, pass: password },
    });
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection failed:', error);
        return res.status(400).json({ success: false, message: error.message });
      } else {
        console.log('SMTP connection successful');
        return res.status(200).json({ success: true, message: 'SMTP connection successful' });
      }
    });
  } catch (error) {
    console.error('Error testing SMTP settings:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  manageAccount,
  changePassword,
  deleteImapAccount,
  editImapAccount,
  updateImapAccount,
  addSmtpAccount,
  createSmtpAccount,
  editSmtpAccount,
  updateSmtpAccount,
  deleteSmtpAccount,
  fetchSmtpSettings,
  testSmtp
};
