const Email = require('../../models/Email');

/**
 * Gets the total number of emails.
 * @returns {Promise<number>}
 */
const getTotalEmails = async () => {
  return await Email.countDocuments();
};

module.exports = {
  getTotalEmails
};
