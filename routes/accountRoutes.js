// /routes/accountRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { isAuthenticated } = require('./middleware/authMiddleware');
const User = require('../models/User');
const ImapAccount = require('../models/ImapAccount');
const SmtpAccount = require('../models/SmtpAccount');
const { getEmailSettings } = require('../services/emailSettingsService');
const router = express.Router();

router.get('/manage', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const imapAccounts = await ImapAccount.find({ userID: req.session.userId });
    const smtpAccounts = await SmtpAccount.find({ userID: req.session.userId });
    res.render('manage-account', { user, imapAccounts, smtpAccounts });
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/change-password', isAuthenticated, async (req, res) => {
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

    user.password = newPassword;
    await user.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/delete-imap-account/:id', isAuthenticated, async (req, res) => {
  try {
    await ImapAccount.findByIdAndDelete(req.params.id);
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error deleting IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit-imap-account/:id', isAuthenticated, async (req, res) => {
  try {
    const imapAccount = await ImapAccount.findById(req.params.id);
    if (!imapAccount) {
      return res.status(404).send('IMAP account not found');
    }
    res.render('edit-imap-account', { imapAccount });
  } catch (error) {
    console.error('Error fetching IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/edit-imap-account/:id', isAuthenticated, async (req, res) => {
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
});

router.get('/add-smtp-account', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('smtp-info', { emailSettings: null, userEmail: user.email });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/add-smtp-account', isAuthenticated, async (req, res) => {
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
});

router.post('/fetch-smtp-settings', isAuthenticated, async (req, res) => {
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
});

router.post('/test-smtp', isAuthenticated, async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;

    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: parseInt(port, 10),
      secure: encryption === 'SSL', // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
    });

    // Verify connection configuration
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
});

module.exports = router;
