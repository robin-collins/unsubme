const { manageAccount } = require('./manageAccountController');
const { changePassword } = require('./changePasswordController');
const { deleteImapAccount, editImapAccount, updateImapAccount } = require('./imapAccountController');
const { addSmtpAccount, createSmtpAccount, editSmtpAccount, updateSmtpAccount, deleteSmtpAccount } = require('./smtpAccountController');
const { fetchSmtpSettings } = require('./smtpSettingsController');
const { testSmtp } = require('./smtpTestController');

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
