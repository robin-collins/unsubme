const Imap = require('imap');
const { decode } = require('iconv-lite');
const Email = require('../models/Email');

const fetchEmails = async (imapConfig, accountID) => {
  const config = {
    user: imapConfig.email,
    password: imapConfig.password, // Ensure password is securely handled
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

  const parseHeader = (header) => {
    const result = {};
    const headerLines = header.split(/\r?\n/);

    headerLines.forEach((line) => {
      const [key, value] = line.split(': ');
      if (key && value) {
        result[key.toLowerCase()] = value;
      }
    });

    return result;
  };

  const parseEmail = async (msg) => {
    let email = {
      from: 'Unknown',
      to: 'Unknown',
      subject: 'No Subject',
      date: new Date(),
      text: 'No Body',
      html: 'No Body',
    };

    return new Promise((resolve, reject) => {
      let buffer = '';

      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
        });

        stream.once('end', () => {
          const [header, ...bodyParts] = buffer.split('\r\n\r\n');
          const headers = parseHeader(header);

          email.from = headers['from'] || email.from;
          email.to = headers['to'] || email.to;
          email.subject = headers['subject'] || email.subject;
          email.date = headers['date'] ? new Date(headers['date']) : email.date;
          email.text = bodyParts.join('\r\n\r\n') || 'No Body';

          resolve(email);
        });
      });

      msg.once('attributes', (attrs) => {
        email.attrs = attrs;
        email.parts = attrs.struct;
        email.uid = attrs.uid; // Extract UID
      });

      msg.once('error', (err) => {
        reject(err);
      });
    });
  };

  const fetchEmailsFromInbox = () => {
    return new Promise((resolve, reject) => {
      imap.search(['ALL'], (err, results) => {
        if (err) reject(err);

        const fetchOptions = {
          bodies: '',
          struct: true,
          markSeen: false,
        };

        const fetchStream = imap.fetch(results, fetchOptions);
        const emails = [];

        fetchStream.on('message', (msg, seqno) => {
          parseEmail(msg)
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
    });
  };

  return new Promise((resolve, reject) => {
    imap.once('ready', async () => {
      try {
        await openInbox();
        const emails = await fetchEmailsFromInbox();

        for (const email of emails) {
          const emailExists = await Email.findOne({ accountID: accountID, uid: email.uid });
          if (!emailExists) {
            const emailModel = new Email({
              accountID: accountID,
              uid: email.uid,
              from: email.from,
              to: email.to,
              subject: email.subject,
              date: email.date,
              body: email.text || 'No Body', // Ensure body is not empty
            });

            await emailModel.save();
            console.log(`Email from ${email.from}: ${email.subject} saved to database.`);
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
