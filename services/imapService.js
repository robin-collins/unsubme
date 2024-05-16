const Imap = require('imap');
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
  const config = {
    user: imapConfig.email,
    password: imapConfig.password,
    host: imapConfig.server,
    port: imapConfig.port,
    tls: true,
    authTimeout: 3000,
  };

  const imap = new Imap(config);

  const openInbox = () => {
    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  };

  const parseEmail = async (msg, uid) => {
    return new Promise((resolve, reject) => {
      const buffer = [];

      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          buffer.push(chunk);
        });

        stream.once('end', async () => {
          try {
            const parsed = await simpleParser(Buffer.concat(buffer));
            resolve({
              from: parsed.from.text,
              to: parsed.to.text,
              subject: parsed.subject || 'No Subject',
              date: parsed.date || new Date(),
              text: parsed.text,
              html: parsed.html,
              uid: uid,
            });
          } catch (error) {
            reject(error);
          }
        });
      });

      msg.once('error', (err) => {
        reject(err);
      });
    });
  };

  const fetchEmailsByUID = (uids) => {
    return new Promise((resolve, reject) => {
      const fetchOptions = {
        bodies: '',
        struct: true,
        markSeen: false,
      };

      const fetchStream = imap.fetch(uids, fetchOptions);
      const emails = [];

      fetchStream.on('message', (msg, seqno) => {
        const uid = uids[seqno - 1];
        parseEmail(msg, uid)
          .then((email) => {
            emails.push(email);
          })
          .catch((err) => {
            console.error('Parsing error:', err);
          });
      });

      fetchStream.once('error', (err) => {
        reject(err);
      });

      fetchStream.once('end', () => {
        resolve(emails);
      });
    });
  };

  const getUIDs = () => {
    return new Promise((resolve, reject) => {
      imap.search(['ALL'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };

  return new Promise((resolve, reject) => {
    imap.once('ready', async () => {
      try {
        await openInbox();
        const uids = await getUIDs();

        // Fetch already processed UIDs from the database
        const processedEmails = await Email.find({ accountID }, 'uid');
        const processedUIDs = processedEmails.map(email => email.uid);

        // Filter out already processed UIDs
        const newUIDs = uids.filter(uid => !processedUIDs.includes(uid));

        if (newUIDs.length === 0) {
          console.log('No new emails to process.');
          imap.end();
          return resolve();
        }

        const emails = await fetchEmailsByUID(newUIDs);

        for (const email of emails) {
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
            isMarketingEmail: isMarketingEmail, // Set isMarketingEmail based on unsubscribe links
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
        }

        imap.end();
        console.log('IMAP connection closed.');
        resolve();
      } catch (error) {
        console.error('Error processing emails:', error.message);
        console.error(error.stack);
        imap.end();
        reject(error);
      }
    });

    imap.once('error', (err) => {
      console.error('IMAP error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended.');
    });

    imap.connect();
  });
};

module.exports = {
  fetchEmails,
};
