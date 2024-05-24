const ImapAccount = require('../../models/ImapAccount');

const deleteImapAccount = async (req, res) => {
  try {
    await ImapAccount.findByIdAndDelete(req.params.id);
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error deleting IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const editImapAccount = async (req, res) => {
  try {
    const imapAccount = await ImapAccount.findById(req.params.id);
    if (!imapAccount) {
      return res.status(404).send('IMAP account not found');
    }
    res.render('imap-info', { imapAccount });
  } catch (error) {
    console.error('Error fetching IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateImapAccount = async (req, res) => {
  try {
    const { emailAddress, imapServer, port, password, schedule } = req.body;
    const imapAccount = await ImapAccount.findById(req.params.id);
    if (!imapAccount) {
      return res.status(404).send('IMAP account not found');
    }
    imapAccount.email = emailAddress;
    imapAccount.server = imapServer;
    imapAccount.port = parseInt(port, 10);
    imapAccount.schedule = schedule;
    if (password) {
      imapAccount.password = password;
    }
    await imapAccount.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error updating IMAP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  deleteImapAccount,
  editImapAccount,
  updateImapAccount
};
