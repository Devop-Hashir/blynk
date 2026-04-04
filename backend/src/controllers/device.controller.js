const Device = require('../models/device.model')

// GET all devices for logged-in user
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.userId })
    res.status(200).json(devices)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ADD new device
exports.addDevice = async (req, res) => {
  try {
    const { name, deviceId, room, type, pins } = req.body

    if (!name || !deviceId) {
      return res.status(400).json({ message: 'Name and Device ID are required' })
    }

    const existing = await Device.findOne({ deviceId })
    if (existing) {
      return res.status(400).json({ message: 'Device ID already exists' })
    }

    const device = new Device({
      userId: req.user.userId,
      name,
      deviceId,
      room: room || 'General',
      type: type || 'other',
      pins: pins || []
    })

    await device.save()
    res.status(201).json({ message: 'Device added successfully', device })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// UPDATE device (name, room, type)
exports.updateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params
    const { name, room, type } = req.body

    const device = await Device.findOneAndUpdate(
      { deviceId, userId: req.user.userId },
      { name, room, type },
      { new: true }
    )

    if (!device) return res.status(404).json({ message: 'Device not found' })
    res.status(200).json({ message: 'Device updated', device })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE device
exports.deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params
    await Device.findOneAndDelete({ deviceId, userId: req.user.userId })
    res.status(200).json({ message: 'Device deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// CONTROL pin — saves state to DB and emits via socket.io to ESP32
exports.controlPin = async (req, res) => {
  try {
    const { deviceId, pin, state } = req.body

    if (!deviceId || !pin || !state) {
      return res.status(400).json({ message: 'deviceId, pin and state are required' })
    }

    // persist state in DB
    await Device.findOneAndUpdate(
      { deviceId, 'pins.pinNumber': pin },
      { $set: { 'pins.$.state': state } }
    )

    // broadcast state_update to all other dashboard sessions (other tabs/devices)
    // do NOT emit 'command' here — the frontend already sends it directly via socket
    const io = req.app.get('io')
    if (io) {
      io.to(req.user.userId.toString()).emit('status_update', { deviceId, pin, state })
    }

    res.status(200).json({ message: `Pin ${pin} set to ${state}` })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ADD pin to device
exports.addPin = async (req, res) => {
  try {
    const { deviceId } = req.params
    const { pinNumber, label } = req.body

    const device = await Device.findOneAndUpdate(
      { deviceId, userId: req.user.userId },
      { $push: { pins: { pinNumber, label, state: 'OFF' } } },
      { new: true }
    )

    if (!device) return res.status(404).json({ message: 'Device not found' })
    res.status(200).json({ message: 'Pin added', device })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// REMOVE pin from device
exports.removePin = async (req, res) => {
  try {
    const { deviceId, pinNumber } = req.params

    const device = await Device.findOneAndUpdate(
      { deviceId, userId: req.user.userId },
      { $pull: { pins: { pinNumber } } },
      { new: true }
    )

    if (!device) return res.status(404).json({ message: 'Device not found' })
    res.status(200).json({ message: 'Pin removed', device })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
