const mongoose = require('mongoose');
const { Schema } = mongoose;

const imapAccountSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, unique: true },
  server: { type: String, required: true },
  port: { type: Number, required: true }, // Changed BigInt to Number
  password: { type: String, required: true }
});

module.exports = mongoose.model('ImapAccount', imapAccountSchema);
