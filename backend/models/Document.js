
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
