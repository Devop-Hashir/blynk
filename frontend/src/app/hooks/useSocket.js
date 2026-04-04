'use client'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(userId) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      // register this browser session as a dashboard client
      socket.emit('dashboard_register', { userId })
    })

    socket.on('disconnect', () => setConnected(false))

    return () => {
      socket.disconnect()
    }
  }, [userId])

  // emit a pin control command
  const controlPin = (deviceId, pin, state) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('control', { deviceId, pin, state, userId })
    }
  }

  return { socket: socketRef.current, connected, controlPin }
}
