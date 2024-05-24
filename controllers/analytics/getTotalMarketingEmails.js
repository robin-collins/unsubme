const Email = require('../../models/Email');

/**
 * Gets the total number of marketing emails.
 * @returns {Promise<number>}
 */
const getTotalMarketingEmails = async () => {
  return await Email.countDocuments({ isMarketingEmail: true });
};

module.exports = {
  getTotalMarketingEmails
};
