const SmtpAccount = require('../../models/SmtpAccount');

/**
 * Gets the total number of SMTP accounts.
 * @returns {Promise<number>}
 */
const getTotalSmtpAccounts = async () => {
  return await SmtpAccount.countDocuments();
};

module.exports = {
  getTotalSmtpAccounts
};
