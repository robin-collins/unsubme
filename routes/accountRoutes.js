const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const accountController = require('../controllers/accountController');
const router = express.Router();

router.get('/manage', isAuthenticated, accountController.manageAccount);
router.post('/change-password', isAuthenticated, accountController.changePassword);
router.post('/delete-imap-account/:id', isAuthenticated, accountController.deleteImapAccount);
router.get('/edit-imap-account/:id', isAuthenticated, accountController.editImapAccount);
router.post('/edit-imap-account/:id', isAuthenticated, accountController.updateImapAccount);
router.get('/add-smtp-account/:id?', isAuthenticated, accountController.addSmtpAccount);
router.post('/add-smtp-account', isAuthenticated, accountController.createSmtpAccount);
router.get('/edit-smtp-account/:id', isAuthenticated, accountController.editSmtpAccount);
router.post('/edit-smtp-account/:id', isAuthenticated, accountController.updateSmtpAccount);
router.post('/delete-smtp-account/:id', isAuthenticated, accountController.deleteSmtpAccount);
router.post('/fetch-smtp-settings', isAuthenticated, accountController.fetchSmtpSettings);
router.post('/test-smtp', isAuthenticated, accountController.testSmtp);

module.exports = router;
