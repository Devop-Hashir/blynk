const VoiceCommand = require('../models/voiceCommand.model')

exports.getCommands = async (req, res) => {
  try {
    const commands = await VoiceCommand.find({ userId: req.user.userId }).sort({ createdAt: -1 })
    res.status(200).json(commands)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.addCommand = async (req, res) => {
  try {
    const { phrase, deviceId, deviceName, pinNumber, pinLabel, action } = req.body

    if (!phrase?.trim() || !deviceId || !pinNumber || !action) {
      return res.status(400).json({ message: 'phrase, deviceId, pinNumber and action are required' })
    }

    // prevent duplicate phrases for same user
    const existing = await VoiceCommand.findOne({
      userId: req.user.userId,
      phrase: phrase.trim().toLowerCase()
    })
    if (existing) {
      return res.status(400).json({ message: 'A command with this phrase already exists' })
    }

    const command = await VoiceCommand.create({
      userId: req.user.userId,
      phrase: phrase.trim().toLowerCase(),
      deviceId, deviceName, pinNumber, pinLabel, action
    })

    res.status(201).json(command)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateCommand = async (req, res) => {
  try {
    const { id } = req.params
    const { phrase, deviceId, deviceName, pinNumber, pinLabel, action } = req.body

    const command = await VoiceCommand.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { phrase: phrase.trim().toLowerCase(), deviceId, deviceName, pinNumber, pinLabel, action },
      { new: true }
    )

    if (!command) return res.status(404).json({ message: 'Command not found' })
    res.status(200).json(command)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteCommand = async (req, res) => {
  try {
    const { id } = req.params
    await VoiceCommand.findOneAndDelete({ _id: id, userId: req.user.userId })
    res.status(200).json({ message: 'Command deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
