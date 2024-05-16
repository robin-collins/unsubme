const mongoose = require('mongoose');
const { Schema } = mongoose;

const unsubscribeLinkSchema = new Schema({
  emailID: { type: Schema.Types.ObjectId, ref: 'Email', required: true },
  link: { type: String, required: true, unique: true},
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

module.exports = mongoose.model('UnsubscribeLink', unsubscribeLinkSchema);
