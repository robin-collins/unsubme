const { ImapFlow } = require('imapflow');
const { decode } = require('iconv-lite');
const Email = require('../models/Email');
const UnsubscribeLink = require('../models/UnsubscribeLink');
const { simpleParser } = require('mailparser');
const extractUrls = require("extract-urls");
const isUrlValid = require('url-validation');
const { URL } = require('url');
const unsubscribePatterns = require('./unsubscribePatterns');

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

const fetchEmails = async (imapConfig, accountID) => {
  const client = new ImapFlow({
    host: imapConfig.server,
    port: imapConfig.port,
    secure: true,
    auth: {
      user: imapConfig.email,
      pass: imapConfig.password,
    },
    logger: {
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error,
    },
  });

  try {
    await client.connect();
    console.log('Connected to IMAP server');

    // Select the INBOX mailbox
    const mailbox = await client.mailboxOpen('INBOX');
    console.log('Mailbox opened:', mailbox.path);

    // Get the list of messages in the mailbox
    const messages = await client.search({ all: true }, { uid: true });
    console.log('Total messages:', messages.length);

    // Fetch already processed UIDs from the database
    const processedEmails = await Email.find({ accountID }, 'uid');
    const processedUIDs = processedEmails.map(email => email.uid);

    // Filter out already processed UIDs
    const newUIDs = messages.filter(uid => !processedUIDs.includes(uid));
    console.log('New messages:', newUIDs.length);

    if (newUIDs.length === 0) {
      console.log('No new emails to process.');
      await client.logout();
      return;
    }

    // Fetch the details of each new message
    for (const uid of newUIDs) {
      try {
        const message = await client.fetchOne(
          uid,
          { body: true, envelope: true, source: true },
          { uid: true }
        );
        console.log('Fetched message UID:', message.uid);

        // Parse the message body and extract relevant information
        const parsed = await simpleParser(message.source);
        const email = {
          from: parsed.from.text,
          to: parsed.to.text,
          subject: parsed.subject || 'No Subject',
          date: parsed.date || new Date(),
          text: parsed.text,
          html: parsed.html,
          uid: message.uid,
        };

        const companyDomain = getPrimaryDomain(email.from);
        const isMarketingEmail = email.html ? extractUnsubscribeLinks(email.html).length > 0 : false;

        const emailModel = new Email({
          accountID: accountID,
          uid: email.uid,
          from: email.from,
          to: email.to,
          subject: email.subject || 'No Subject',
          date: email.date || new Date(),
          body: email.text || 'No Body',
          companyDomain: companyDomain,
          isMarketingEmail: isMarketingEmail,
        });

        const savedEmail = await emailModel.save();
        console.log(`Email from ${email.from}: ${email.subject} saved to database.`);

        if (isMarketingEmail) {
          const unsubscribeLinks = extractUnsubscribeLinks(email.html);
          const linksArray = unsubscribeLinks.split('|| ').filter(link => link);
          for (const link of linksArray) {
            try {
              const existingLink = await UnsubscribeLink.findOne({ link });
              if (!existingLink) {
                const unsubscribeLinkModel = new UnsubscribeLink({
                  emailID: savedEmail._id,
                  link,
                });
                await unsubscribeLinkModel.save();
              } else {
                console.log(`Unsubscribe link ${link} already exists in the database.`);
              }
            } catch (linkError) {
              console.error('Error saving unsubscribe link:', linkError.message);
            }
          }
        }
      } catch (messageError) {
        console.error('Error processing message:', messageError);
      }
    }

    await client.logout();
    console.log('Logged out from IMAP server');
  } catch (error) {
    console.error('Error connecting to IMAP server:', error);
  }
};

module.exports = {
  fetchEmails,
};