const SmtpAccount = require('../../models/SmtpAccount');
const User = require('../../models/User');

const addSmtpAccount = async (req, res) => {
  try {
    const smtpAccount = await SmtpAccount.findOne({ _id: req.params.id, userID: req.session.userId });
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('smtp-info', { smtpAccount, userEmail: user.email });
  } catch (error) {
    console.error('Error fetching SMTP account:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const createSmtpAccount = async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;
    const smtpAccount = new SmtpAccount({
      userID: req.session.userId,
      email: emailAddress,
      username: username,
      server: smtpServer,
      port: parseInt(port, 10),
      password: password,
      encryption: encryption,
    });
    await smtpAccount.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error adding SMTP account:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const editSmtpAccount = async (req, res) => {
  try {
    const smtpAccount = await SmtpAccount.findById(req.params.id);
    if (!smtpAccount) {
      return res.status(404).send('SMTP account not found');
    }
    res.render('smtp-info', { smtpAccount, userEmail: smtpAccount.email });
  } catch (error) {
    console.error('Error fetching SMTP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateSmtpAccount = async (req, res) => {
  try {
    const { emailAddress, username, smtpServer, port, password, encryption } = req.body;
    const smtpAccount = await SmtpAccount.findById(req.params.id);
    if (!smtpAccount) {
      return res.status(404).send('SMTP account not found');
    }
    smtpAccount.email = emailAddress;
    smtpAccount.username = username;
    smtpAccount.server = smtpServer;
    smtpAccount.port = parseInt(port, 10);
    smtpAccount.encryption = encryption;
    if (password) {
      smtpAccount.password = password;
    }
    await smtpAccount.save();
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error updating SMTP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

const deleteSmtpAccount = async (req, res) => {
  try {
    await SmtpAccount.findByIdAndDelete(req.params.id);
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error deleting SMTP account:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  addSmtpAccount,
  createSmtpAccount,
  editSmtpAccount,
  updateSmtpAccount,
  deleteSmtpAccount
};
