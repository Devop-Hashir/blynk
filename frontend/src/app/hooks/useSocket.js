'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

// Read userId directly from JWT cookie — no waiting for useEffect
function getUserIdFromCookie() {
  if (typeof document === 'undefined') return null
  try {
    const token = document.cookie
      .split('; ')
      .find(r => r.startsWith('token='))
      ?.split('=')[1]
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1])).userId || null
  } catch {
    return null
  }
}

export function useSocket(userIdProp) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineDevices, setOnlineDevices] = useState([])

  // Use prop if provided, otherwise read from cookie immediately
  const userId = userIdProp || getUserIdFromCookie()

  useEffect(() => {
    if (!userId) {
      console.log('[useSocket] No userId — skipping')
      return
    }

    console.log(`[useSocket] Connecting for userId=${userId}`)

    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log(`[useSocket] ✅ Connected id=${socket.id}`)
      setConnected(true)
      // Register and immediately request current device list
      socket.emit('dashboard_register', { userId })
      socket.emit('get_online_devices')
    })

    socket.on('disconnect', (reason) => {
      console.log(`[useSocket] ❌ Disconnected reason=${reason}`)
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error(`[useSocket] Connect error: ${err.message}`)
      setConnected(false)
    })

    socket.on('online_devices', ({ deviceIds }) => {
      console.log(`[useSocket] 📋 online_devices:`, deviceIds)
      setOnlineDevices(deviceIds || [])
    })

    socket.on('device_online', ({ deviceId }) => {
      console.log(`[useSocket] 🟢 device_online: ${deviceId}`)
      setOnlineDevices(prev =>
        prev.includes(deviceId) ? prev : [...prev, deviceId]
      )
    })

    socket.on('device_offline', ({ deviceId }) => {
      console.log(`[useSocket] 🔴 device_offline: ${deviceId}`)
      setOnlineDevices(prev => prev.filter(id => id !== deviceId))
    })

    socket.on('device_error', ({ deviceId, message }) => {
      console.warn(`[useSocket] ⚠️ device_error ${deviceId}: ${message}`)
    })

    socket.on('status_update', ({ deviceId, pin, state }) => {
      console.log(`[useSocket] 🔄 status_update ${deviceId} pin=${pin} state=${state}`)
    })

    // Poll every 5s for first minute in case of timing gaps
    let polls = 0
    const fastPoll = setInterval(() => {
      polls++
      if (socket.connected) {
        socket.emit('get_online_devices')
      }
      if (polls >= 12) clearInterval(fastPoll)
    }, 5000)

    // Then poll every 30s forever
    const slowPoll = setInterval(() => {
      if (socket.connected) socket.emit('get_online_devices')
    }, 30000)

    return () => {
      clearInterval(fastPoll)
      clearInterval(slowPoll)
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  const controlPin = useCallback((deviceId, pin, state) => {
    console.log(`[useSocket] controlPin ${deviceId} pin=${pin} state=${state}`)
    if (socketRef.current?.connected) {
      socketRef.current.emit('control', { deviceId, pin, state })
    } else {
      console.warn('[useSocket] Not connected — cannot control')
    }
  }, [])

  const isDeviceOnline = useCallback((deviceId) => {
    return onlineDevices.includes(deviceId)
  }, [onlineDevices])

  return {
    socket: socketRef.current,
    connected,
    onlineDevices,
    controlPin,
    isDeviceOnline,
  }
}