/**
 * Extracts the primary domain from an email address.
 * @param {string} email - The email address to extract the domain from.
 * @returns {string} - The primary domain.
 */
function getPrimaryDomain(email) {
  try {
    const domain = email.split('@')[1];
    const domainParts = domain.split('.');
    if (domainParts.length > 2) {
      // Assuming the last two parts are the TLD and the primary domain
      return `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
    }
    return domain;
  } catch (error) {
    console.error('Error extracting primary domain:', error);
    return '';
  }
}

/**
 * Parses the original URL from an Outlook safe link.
 * @param {string} url - The encoded Outlook safe link.
 * @returns {string} - The original URL.
 */
function parseOutlookSafeURL(url) {
  const urlQuery = "url=";
  const urlIndex = url.indexOf(urlQuery) + urlQuery.length;
  const dataQuery = "&data=";
  const dataIndex = url.indexOf(dataQuery);

  if (dataIndex === -1) {
    return url.substring(urlIndex);
  }

  return url.substring(urlIndex, dataIndex);
}

/**
 * Replaces Outlook safe links in the provided text with their original URLs.
 * @param {string} text - The text containing Outlook safe links.
 * @returns {string} - The text with Outlook safe links replaced by original URLs.
 */
function replaceOutlookSafeURLs(text) {
  return text.replace(/https:\/\/[a-zA-Z0-9.-]*safelinks.protection.outlook.com\/\S+/g, match => {
    return decodeURIComponent(parseOutlookSafeURL(match));
  });
}

module.exports = {
  getPrimaryDomain,
  parseOutlookSafeURL,
  replaceOutlookSafeURLs
};
