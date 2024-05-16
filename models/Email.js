// /models/Email.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const emailSchema = new mongoose.Schema({
  accountID: { type: Schema.Types.ObjectId, ref: 'ImapAccount', required: true },
  uid: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  body: { type: String, required: true },
  companyDomain: { type: String, required: true }, // New field
});

emailSchema.index({ accountID: 1, uid: 1 }, { unique: true });

module.exports = mongoose.model('Email', emailSchema);
