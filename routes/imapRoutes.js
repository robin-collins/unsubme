// routes/imapRoutes.js
const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const imapController = require('../controllers/imapController');
const router = express.Router();

router.get('/add-imap-account', isAuthenticated, imapController.showAddImapAccount);
router.post('/imap-info', isAuthenticated, imapController.addImapAccount);
router.post('/fetch-email-settings', isAuthenticated, imapController.fetchEmailSettings);
router.get('/fetch-emails', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  await imapController.fetchEmails(req, res, userId);
});

module.exports = router;
