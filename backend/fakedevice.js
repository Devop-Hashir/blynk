const { io } = require('socket.io-client')

const socket = io('http://localhost:5000')

socket.on('connect', () => {
  console.log('✅ Fake ESP32 connected')

  // register as a device
  socket.emit('device_register', {
    deviceId: 'esp32-test' // same as what you add in dashboard
  })
})

// listen for commands from dashboard
socket.on('command', (data) => {
  console.log(`📡 Command received → Pin: ${data.pin} State: ${data.state}`)
  
  // simulate sending status back
  socket.emit('status_update', {
    userId: '69cd6cbc3ddda2afc3386ff8',
    deviceId: 'esp32-test',
    pin: data.pin,
    state: data.state
  })
})

socket.on('disconnect', () => {
  console.log('❌ Disconnected')
})