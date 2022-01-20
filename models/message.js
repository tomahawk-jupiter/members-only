const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  text: { type: String, required: true },
  author: { type: String, required: true }
});

MessageSchema
.virtual('formatted_timestamp')
.get(function() {
  const date = this.timestamp.toDateString();
  const time = this.timestamp.toLocaleTimeString();
  return date + ' @ ' + time;
});

module.exports = mongoose.model('Message', MessageSchema);