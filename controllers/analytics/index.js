const { getTotalEmails } = require('./getTotalEmails');
const { getTotalMarketingEmails } = require('./getTotalMarketingEmails');
const { getTotalImapAccounts } = require('./getTotalImapAccounts');
const { getTotalSmtpAccounts } = require('./getTotalSmtpAccounts');
const { getTopEmailDomains } = require('./getTopEmailDomains');
const { getLast30Days } = require('./getLast30Days');
const { getEmailCountsPerDay } = require('./getEmailCountsPerDay');
const { getDashboardData } = require('./getDashboardData');

module.exports = {
  getTotalEmails,
  getTotalMarketingEmails,
  getTotalImapAccounts,
  getTotalSmtpAccounts,
  getTopEmailDomains,
  getLast30Days,
  getEmailCountsPerDay,
  getDashboardData
};
