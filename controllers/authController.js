// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

const showRegister = (req, res) => {
  res.render('register');
};

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    await User.create({ username, password, email });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
};

const showLogin = (req, res) => {
  res.render('login', { query: req.query });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Password is incorrect');
    }
    req.session.userId = user._id;
    const redirectTo = req.session.redirectTo || '/dashboard';
    delete req.session.redirectTo;
    return res.redirect(redirectTo);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send(error.message);
  }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/auth/login');
  });
};

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  logout
};
