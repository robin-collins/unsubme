const ImapAccount = require('../../models/ImapAccount');

/**
 * Gets the total number of IMAP accounts.
 * @returns {Promise<number>}
 */
const getTotalImapAccounts = async () => {
  return await ImapAccount.countDocuments();
};

module.exports = {
  getTotalImapAccounts
};
