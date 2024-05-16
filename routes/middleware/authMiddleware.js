const User = require('../../models/User');
const ImapAccount = require('../../models/ImapAccount');

const isAuthenticated = async (req, res, next) => {
  res.locals.hasImapAccount = false; // Set default value for hasImapAccount
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(401).send('User not found');
      }
      req.user = user;

      // Check if user has an IMAP account
      const imapAccount = await ImapAccount.findOne({ userID: req.session.userId });
      res.locals.hasImapAccount = !!imapAccount;

      return next();
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    return res.status(401).send('You are not authenticated');
  }
};

module.exports = {
  isAuthenticated
};
