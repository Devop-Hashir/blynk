const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth.middleware')
const { getCommands, addCommand, updateCommand, deleteCommand } = require('../controllers/voiceCommand.controller')

router.get('/', protect, getCommands)
router.post('/add', protect, addCommand)
router.put('/:id', protect, updateCommand)
router.delete('/:id', protect, deleteCommand)

module.exports = router
