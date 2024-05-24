const { fetchEmails } = require('./fetchEmails');
const { extractUnsubscribeLinks } = require('./extractUnsubscribeLinks');
const { getPrimaryDomain, parseOutlookSafeURL, replaceOutlookSafeURLs } = require('./imapUtils');

module.exports = {
  fetchEmails,
  extractUnsubscribeLinks,
  getPrimaryDomain,
  parseOutlookSafeURL,
  replaceOutlookSafeURLs
};
