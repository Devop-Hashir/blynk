const mongoose = require('mongoose')

const pinSchema = new mongoose.Schema({
  pinNumber: { type: String, required: true }, // e.g "D1", "D2", "GPIO2"
  label: { type: String, required: true },     // e.g "Living Room Light"
  state: { type: String, default: 'OFF' },     // "ON" or "OFF"
})

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  deviceId: { type: String, required: true, unique: true },
  room: { type: String, default: 'General' },
  type: { type: String, default: 'other' },
  pins: [pinSchema],
  isOnline: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Device', deviceSchema)