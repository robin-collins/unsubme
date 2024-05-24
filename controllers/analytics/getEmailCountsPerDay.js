const Email = require('../../models/Email');

/**
 * Gets email counts per day for the last 30 days.
 * @param {Array<string>} dates - Array of dates for the last 30 days.
 * @returns {Promise<{totalEmailsPerDay: Array<number>, marketingEmailsPerDay: Array<number>}>}
 */
const getEmailCountsPerDay = async (dates, imapAccountId) => {
  const totalEmailsPerDay = new Array(dates.length).fill(0);
  const marketingEmailsPerDay = new Array(dates.length).fill(0);

  const emails = await Email.aggregate([
    { $match: { date: { $gte: new Date(dates[0]), $lte: new Date(dates[dates.length - 1] + 'T23:59:59.999Z') }, accountID: imapAccountId } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 }, marketingCount: { $sum: { $cond: ["$isMarketingEmail", 1, 0] } } } },
    { $sort: { _id: 1 } }
  ]);

  emails.forEach(email => {
    const index = dates.indexOf(email._id);
    if (index !== -1) {
      totalEmailsPerDay[index] = email.count;
      marketingEmailsPerDay[index] = email.marketingCount;
    }
  });

  return { totalEmailsPerDay, marketingEmailsPerDay };
};

module.exports = {
  getEmailCountsPerDay
};
