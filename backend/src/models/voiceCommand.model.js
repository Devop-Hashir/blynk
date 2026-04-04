const mongoose = require('mongoose')

const voiceCommandSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phrase: { type: String, required: true },       // what user says e.g. "turn on fan"
  deviceId: { type: String, required: true },      // target device
  deviceName: { type: String, required: true },    // for display
  pinNumber: { type: String, required: true },     // target pin e.g. "D2"
  pinLabel: { type: String, required: true },      // for display e.g. "Ceiling Fan"
  action: { type: String, enum: ['ON', 'OFF'], required: true },
}, { timestamps: true })

module.exports = mongoose.model('VoiceCommand', voiceCommandSchema)
