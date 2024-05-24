const nodemailer = require('nodemailer');

const testSmtp = async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: parseInt(port, 10),
      secure: encryption === 'SSL',
      auth: { user: username, pass: password },
    });
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection failed:', error);
        return res.status(400).json({ success: false, message: error.message });
      } else {
        console.log('SMTP connection successful');
        return res.status(200).json({ success: true, message: 'SMTP connection successful' });
      }
    });
  } catch (error) {
    console.error('Error testing SMTP settings:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  testSmtp
};
