const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🏠' },
}, { timestamps: true })

module.exports = mongoose.model('Room', roomSchema)
