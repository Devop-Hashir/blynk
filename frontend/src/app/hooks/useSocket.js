'use client'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(userId) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineDevices, setOnlineDevices] = useState(new Set())

  useEffect(() => {
    if (!userId) return

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('dashboard_register', { userId })
    })

    socket.on('disconnect', () => setConnected(false))

    // ← device came online
    socket.on('device_online', (data) => {
      console.log('Device online:', data.deviceId)
      setOnlineDevices(prev => new Set([...prev, data.deviceId]))
    })

    // ← device went offline
    socket.on('device_offline', (data) => {
      console.log('Device offline:', data.deviceId)
      setOnlineDevices(prev => {
        const next = new Set(prev)
        next.delete(data.deviceId)
        return next
      })
    })

    // ← get currently online devices when dashboard connects
    socket.on('online_devices', (data) => {
      console.log('Online devices:', data.deviceIds)
      setOnlineDevices(new Set(data.deviceIds))
    })

    return () => {
      socket.disconnect()
    }
  }, [userId])

  const controlPin = (deviceId, pin, state) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('control', { deviceId, pin, state, userId })
    }
  }

  // check if specific device is online
  const isDeviceOnline = (deviceId) => onlineDevices.has(deviceId)

  return {
    socket: socketRef.current,
    connected,
    controlPin,
    onlineDevices,      // ← Set of online device IDs
    isDeviceOnline,     // ← helper function
  }
}