const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth.middleware')
const { getRooms, addRoom, updateRoom, deleteRoom } = require('../controllers/room.controller')

router.get('/', protect, getRooms)
router.post('/add', protect, addRoom)
router.put('/:id', protect, updateRoom)
router.delete('/:id', protect, deleteRoom)

module.exports = router
