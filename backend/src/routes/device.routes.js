const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth.middleware')
const {
  addDevice,
  getDevices,
  updateDevice,
  deleteDevice,
  controlPin,
  addPin,
  removePin,
} = require('../controllers/device.controller')

router.get('/', protect, getDevices)
router.post('/add', protect, addDevice)
router.put('/:deviceId', protect, updateDevice)
router.delete('/:deviceId', protect, deleteDevice)
router.post('/control', protect, controlPin)
router.post('/:deviceId/pins', protect, addPin)
router.delete('/:deviceId/pins/:pinNumber', protect, removePin)

module.exports = router
