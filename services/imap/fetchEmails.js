const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const Email = require('../../models/Email');
const UnsubscribeLink = require('../../models/UnsubscribeLink');
const { io } = require('../../server'); // Import the io instance
const { extractUnsubscribeLinks, replaceOutlookSafeURLs, getPrimaryDomain } = require('./imapUtils');

/**
 * Fetches emails from the IMAP server and saves them to the database.
 * @param {Object} imapConfig - The IMAP configuration.
 * @param {string} accountID - The account ID.
 * @param {string} userId - The user ID for WebSocket communication.
 */
const fetchEmails = async (imapConfig, accountID, userId) => {
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

    const mailbox = await client.mailboxOpen('INBOX');
    console.log('Mailbox opened:', mailbox.path);

    const messages = await client.search({ all: true }, { uid: true });
    console.log('Total messages:', messages.length);

    const processedEmails = await Email.find({ accountID }, 'uid');
    const processedUIDs = processedEmails.map(email => email.uid);

    const newUIDs = messages.filter(uid => !processedUIDs.includes(uid));
    console.log('New messages:', newUIDs.length);

    if (newUIDs.length === 0) {
      console.log('No new emails to process.');
      await client.logout();
      return;
    }

    for (const [index, uid] of newUIDs.entries()) {
      try {
        const message = await client.fetchOne(
          uid,
          { body: true, envelope: true, source: true },
          { uid: true }
        );
        console.log('Fetched message UID:', message.uid);

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

        // Emit progress update
        const progress = Math.round(((index + 1) / newUIDs.length) * 100);
        io.to(userId).emit('fetch-progress', { current: index + 1, total: newUIDs.length, progress });
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
