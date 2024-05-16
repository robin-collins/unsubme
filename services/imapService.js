// /services/imapService.js
const Imap = require('imap');
const { decode } = require('iconv-lite');
const Email = require('../models/Email');
const UnsubscribeLink = require('../models/UnsubscribeLink');
const { simpleParser } = require('mailparser');
const extractUrls = require("extract-urls");
const isUrlValid = require('url-validation');
const { URL } = require('url');

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

function extractUnsubscribeLinks(emailBodyText) {
  const patterns = [
      /(?:manage\s+preferences|update\s+your\s+profile)\s*<(https?:\/\/[^>]+)>/gi,
      /(?:unsubscribe|opt[ -]out|remove)\s*here[^<]*<(https?:\/\/[^>]+)>/gi,
      /(?:unsubscribe|subscription\s*preferences)\s*:\s*(https?:\/\/[^<\s]+)/gi,
      /<a href="(https?:\/\/[^"]+)"[^>]*>Unsubscribe<\/a>/gi,
      /<a[^>]*href="(https?:\/\/[^"]*unsub[^"]*)"[^>]*>/gi,
      /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>\s*(?:unsubscribe|opt[ -]out|remove)\s*<\/a>/gi,
      /Unsubscribe<(https?:\/\/[^>]+)>/gi,
      /\((https?:\/\/.*?(?:unsubscribe|opt-out).*?)\)/gi,
      /click\s+below\s+to\s+unsubscribe[^<]*<(https?:\/\/[^>]+)>/gi,
      /click\s+here\s*<(https?:\/\/[^>]+)>/gi,
      /click\s+here\s+to\s+change\s+your\s+email\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
      /email\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
      /href="(https?:\/\/[^"]*(?:unsubscribe|opt[ -]out|remove)[^"]*)"[^>]*>(?:unsubscribe|opt[ -]out|remove)\s*here<\/a>/gi,
      /href="(https?:\/\/[^"]+unsub[^"]+)"/gi,
      /https?:\/\/\S+unsub\S+/gi,
      /https?:\/\/\S+unsubscribe\S+/gi,
      /manage\s+your\s+email\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
      /preferences\s*center[^<]*<(https?:\/\/[^>]+)>/gi,
      /to\s+unsubscribe[^<]+<(https?:\/\/[^>]+)>/gi,
      /unsub.+?href="(https?:\/\/[^"]+)"/gi,
      /unsub[^<]+<(https?:\/\/[^>]+)>/gi,
      /unsubscribe\s+from\s+this\s+list[^<]*<(https?:\/\/[^>]+)>/gi,
      /update\s+your\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
      /https?:\/\/\S+preferences-center\S+/gi,
      /https?:\/\/\S+proc\.php\S+act=unsub/gi,
      /https?:\/\/\S+ls\/click\S+upn=\S+/gi,
      /https?:\/\/\S+link\/c\/\S+/gi,
      /https?:\/\/\S+link-tracker\S+/gi,
      /https?:\/\/\S+email_preferences\S+/gi,
      /https?:\/\/\S+subscription_center\S+/gi,
      /https?:\/\/\S+manage_subscriptions\S+/gi,
      /https?:\/\/\S+email_settings\S+/gi,
      /https?:\/\/\S+communication_preferences\S+/gi,
      /https?:\/\/\S+email_options\S+/gi,
      /https?:\/\/\S+unsubscribe_center\S+/gi,
      /https?:\/\/\S+manage_email_preferences\S+/gi,
      /https?:\/\/\S+subscription_management\S+/gi,
      /https?:\/\/\S+email_preference_center\S+/gi,
    ];

  const unsubscribeLinks = patterns.reduce((links, pattern) => {
    const matches = emailBodyText.match(pattern);
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
        const emails = await fetchEmailsByUID(uids);

        for (const email of emails) {
          const emailExists = await Email.findOne({ accountID: accountID, uid: email.uid });
          if (!emailExists) {
            const companyDomain = getPrimaryDomain(email.from);
            const emailModel = new Email({
              accountID: accountID,
              uid: email.uid,
              from: email.from,
              to: email.to,
              subject: email.subject || 'No Subject',
              date: email.date || new Date(),
              body: email.text || 'No Body',
              companyDomain: companyDomain, // Store the primary domain
            });

            const savedEmail = await emailModel.save();
            console.log(`Email from ${email.from}: ${email.subject} saved to database.`);

            if (email.html) {
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
          } else {
            console.log(`Email from ${email.from}: ${email.subject} already exists in the database.`);
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
