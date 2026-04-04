const Room = require('../models/room.model')
const Device = require('../models/device.model')

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.user.userId }).sort({ createdAt: 1 })
    res.status(200).json(rooms)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.addRoom = async (req, res) => {
  try {
    const { name, icon } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Room name is required' })

    const existing = await Room.findOne({ userId: req.user.userId, name: name.trim() })
    if (existing) return res.status(400).json({ message: 'Room already exists' })

    const room = await Room.create({ userId: req.user.userId, name: name.trim(), icon: icon || '🏠' })
    res.status(201).json(room)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params
    const { name, icon } = req.body
    const room = await Room.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, icon },
      { new: true }
    )
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.status(200).json(room)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params
    const room = await Room.findOne({ _id: id, userId: req.user.userId })
    if (!room) return res.status(404).json({ message: 'Room not found' })

    // delete all devices in this room too
    await Device.deleteMany({ userId: req.user.userId, room: room.name })
    await room.deleteOne()
    res.status(200).json({ message: 'Room and its devices deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
