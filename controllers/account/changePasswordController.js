const bcrypt = require('bcrypt');
const User = require('../../models/User');

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send('New passwords do not match');
    }
    const user = await User.findById(req.session.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('Current password is incorrect');
    }
    user.password = newPassword; // Set the new password directly
    await user.save(); // The pre('save') middleware will hash the new password
    res.redirect('/account/manage');
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  changePassword
};
