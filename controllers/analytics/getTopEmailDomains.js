const Email = require('../../models/Email');

/**
 * Gets the top email domains.
 * @returns {Promise<Array>}
 */
const getTopEmailDomains = async (imapAccountId) => {
  return await Email.aggregate([
    { $match: { accountID: imapAccountId } },
    { $group: { _id: "$companyDomain", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = {
  getTopEmailDomains
};
