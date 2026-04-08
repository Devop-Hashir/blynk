'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export function useSocket(userId) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineDevices, setOnlineDevices] = useState([])

  useEffect(() => {
    if (!userId) return

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['polling', 'websocket'], // start with polling so Railway proxy works, then upgrades
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔌 Socket connected')
      setConnected(true)
      socket.emit('dashboard_register', { userId })

      // poll a few times after connect to catch any timing issues
      ;[500, 2000, 5000].forEach(delay => {
        setTimeout(() => {
          if (socket.connected) {
            console.log(`⏱ Polling online devices at ${delay}ms`)
            socket.emit('get_online_devices')
          }
        }, delay)
      })
    })

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      setConnected(false)
      setOnlineDevices([])
    })

    socket.on('device_online', (data) => {
      console.log('🟢 Device online:', data.deviceId)
      setOnlineDevices(prev =>
        prev.includes(data.deviceId) ? prev : [...prev, data.deviceId]
      )
    })

    socket.on('device_offline', (data) => {
      console.log('🔴 Device offline:', data.deviceId)
      setOnlineDevices(prev => prev.filter(id => id !== data.deviceId))
    })

    socket.on('online_devices', (data) => {
      console.log('📋 Online devices received:', data.deviceIds)
      setOnlineDevices(data.deviceIds || [])
    })

    // heartbeat: re-poll every 30s in case we missed a device_online event
    const heartbeat = setInterval(() => {
      if (socket.connected) socket.emit('get_online_devices')
    }, 30000)

    return () => {
      clearInterval(heartbeat)
      socket.disconnect()
    }
  }, [userId])

  const controlPin = useCallback((deviceId, pin, state) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('control', { deviceId, pin, state, userId })
    }
  }, [userId])

  const isDeviceOnline = useCallback((deviceId) => {
    return onlineDevices.includes(deviceId)
  }, [onlineDevices])

  return {
    socket: socketRef.current,
    connected,
    controlPin,
    onlineDevices,
    isDeviceOnline,
  }
}