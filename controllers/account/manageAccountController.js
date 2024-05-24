const User = require('../../models/User');
const ImapAccount = require('../../models/ImapAccount');
const SmtpAccount = require('../../models/SmtpAccount');

const manageAccount = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const imapAccounts = await ImapAccount.find({ userID: req.session.userId });
    const smtpAccounts = await SmtpAccount.find({ userID: req.session.userId });
    res.render('manage-account', { user, imapAccounts, smtpAccounts });
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  manageAccount
};
