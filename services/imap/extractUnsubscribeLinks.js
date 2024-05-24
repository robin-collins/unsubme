// services/imap/extractUnsubscribeLinks.js
const extractUrls = require("extract-urls");
const isUrlValid = require('url-validation');
const { replaceOutlookSafeURLs } = require('./imapUtils');
const unsubscribePatterns = require('../unsubscribePatterns');

/**
 * Extracts unsubscribe links from the email body text.
 * @param {string} emailBodyText - The email body text.
 * @returns {string} - The unsubscribe links separated by "|| ".
 */
function extractUnsubscribeLinks(emailBodyText) {
  const cleanedText = replaceOutlookSafeURLs(emailBodyText); // Clean the text from Outlook safe links
  const unsubscribeLinks = unsubscribePatterns.reduce((links, pattern) => {
    const matches = cleanedText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const urlMatch = extractUrls(match);
        if (urlMatch) {
          links.push(...urlMatch);
        }
      });
    }
    return links;
  }, []);

  const uniqueLinks = [...new Set(unsubscribeLinks.filter(link => isUrlValid(link)))];
  return uniqueLinks.join("|| ");
}

module.exports = {
  extractUnsubscribeLinks
};
