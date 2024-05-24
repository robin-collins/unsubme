// controllers/analyticsController.js
const Email = require('../models/Email');
const ImapAccount = require('../models/ImapAccount');
const SmtpAccount = require('../models/SmtpAccount');

/**
 * Gets the total number of emails.
 * @returns {Promise<number>}
 */
const getTotalEmails = async () => {
  return await Email.countDocuments();
};

/**
 * Gets the total number of marketing emails.
 * @returns {Promise<number>}
 */
const getTotalMarketingEmails = async () => {
  return await Email.countDocuments({ isMarketingEmail: true });
};

/**
 * Gets the total number of IMAP accounts.
 * @returns {Promise<number>}
 */
const getTotalImapAccounts = async () => {
  return await ImapAccount.countDocuments();
};

/**
 * Gets the total number of SMTP accounts.
 * @returns {Promise<number>}
 */
const getTotalSmtpAccounts = async () => {
  return await SmtpAccount.countDocuments();
};

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

/**
 * Generates an array of dates for the last 30 days.
 * @returns {Array<string>}
 */
const getLast30Days = () => {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

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

/**
 * Gets the dashboard data and renders the dashboard view.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getDashboardData = async (req, res) => {
  try {
    const imapAccount = await ImapAccount.findOne({ userID: req.session.userId });
    if (!imapAccount) {
      return res.status(400).send('No IMAP accounts found for the user.');
    }

    const totalEmails = await getTotalEmails();
    const totalMarketingEmails = await getTotalMarketingEmails();
    const totalImapAccounts = await getTotalImapAccounts();
    const totalSmtpAccounts = await getTotalSmtpAccounts();
    const topEmailDomains = await getTopEmailDomains(imapAccount._id);
    const imapAccountEmail = imapAccount.email;

    const dates = getLast30Days();
    const { totalEmailsPerDay, marketingEmailsPerDay } = await getEmailCountsPerDay(dates, imapAccount._id);

    res.render('dashboard', {
      totalEmails,
      totalMarketingEmails,
      totalImapAccounts,
      totalSmtpAccounts,
      topEmailDomains: topEmailDomains.map(domain => ({ _id: domain._id.replace(/>/g, ''), count: domain.count })), // Remove '>' from domain names
      imapAccountEmail,
      dates,
      totalEmailsPerDay,
      marketingEmailsPerDay
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getDashboardData
};
