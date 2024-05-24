const ImapAccount = require('../../models/ImapAccount');
const { getTotalEmails } = require('./getTotalEmails');
const { getTotalMarketingEmails } = require('./getTotalMarketingEmails');
const { getTotalImapAccounts } = require('./getTotalImapAccounts');
const { getTotalSmtpAccounts } = require('./getTotalSmtpAccounts');
const { getTopEmailDomains } = require('./getTopEmailDomains');
const { getLast30Days } = require('./getLast30Days');
const { getEmailCountsPerDay } = require('./getEmailCountsPerDay');

/**
 * Gets the dashboard data and renders the dashboard view.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getDashboardData = async (req, res) => {
  try {
    const imapAccount = await ImapAccount.findOne({ userID: req.session.userId });
    if (!imapAccount) {
      return res.redirect('/imap/add-imap-account?message=No IMAP accounts found for the user.');
    }

    const totalEmails = await getTotalEmails();
    const totalMarketingEmails = await getTotalMarketingEmails();
    const totalImapAccounts = await getTotalImapAccounts();
    const totalSmtpAccounts = await getTotalSmtpAccounts();
    const topEmailDomains = await getTopEmailDomains(imapAccount._id);
    const imapAccountEmail = imapAccount.email;

    const dates = getLast30Days();
    const { totalEmailsPerDay, marketingEmailsPerDay } = await getEmailCountsPerDay(dates, imapAccount._id);
    const userId = req.session.userId || '';
    res.render('dashboard', {
      userId,
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
