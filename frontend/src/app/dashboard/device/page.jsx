'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, getUserId } from '@/app/lib/api'
import { useSocket } from '@/app/hooks/useSocket'
import Navbar from '../components/Navbar'
import Toggle from '../components/Toggle'
import ErrorBar from '../components/ErrorBar'
import { inp, lbl, btnPrimary } from '../styles/common'

const ICONS = { light: '💡', fan: '🌀', ac: '❄️', tv: '📺', plug: '🔌', door: '🚪', other: '⚙️' }
const ALL_PINS = Array.from({ length: 14 }, (_, i) => `D${i}`)

function DevicePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deviceId = searchParams.get('id') || ''

  const [userId, setUserId] = useState(null)
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pinForm, setPinForm] = useState({ pinNumber: 'D0', label: '' })
  const [showPinModal, setShowPinModal] = useState(false)
  const [error, setError] = useState('')

  const { socket, connected, controlPin } = useSocket(userId)
  useEffect(() => { setUserId(getUserId()) }, [])

  const loadDevice = useCallback(async () => {
    if (!deviceId) return
    try {
      const all = await api.getDevices()
      const found = all.find(d => d.deviceId === deviceId)
      if (!found) { router.push('/dashboard'); return }
      setDevice(found)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [deviceId, router])

  useEffect(() => { loadDevice() }, [loadDevice])

  useEffect(() => {
    if (!socket || !device) return
    const onStatus = ({ deviceId: dId, pin, state }) => {
      if (dId !== deviceId) return
      setDevice(prev => ({ ...prev, pins: prev.pins.map(p => p.pinNumber === pin ? { ...p, state } : p) }))
    }
    socket.on('status_update', onStatus)
    return () => socket.off('status_update', onStatus)
  }, [socket, device, deviceId])

  const handleToggle = async (pin) => {
    const newState = pin.state === 'ON' ? 'OFF' : 'ON'
    setDevice(prev => ({ ...prev, pins: prev.pins.map(p => p.pinNumber === pin.pinNumber ? { ...p, state: newState } : p) }))
    controlPin(deviceId, pin.pinNumber, newState)
    try { await api.controlPin({ deviceId, pin: pin.pinNumber, state: newState }) } catch {}
  }

  const handleAddPin = async () => {
    if (!pinForm.label.trim()) return
    try {
      await api.addPin(deviceId, pinForm)
      await loadDevice()
      setShowPinModal(false)
      setPinForm({ pinNumber: 'D0', label: '' })
    } catch (e) { setError(e.message) }
  }

  const handleRemovePin = async (pinNumber) => {
    try {
      await api.removePin(deviceId, pinNumber)
      setDevice(prev => ({ ...prev, pins: prev.pins.filter(p => p.pinNumber !== pinNumber) }))
    } catch (e) { setError(e.message) }
  }

  if (!deviceId) { router.push('/dashboard'); return null }
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading...</div>
  if (!device) return null

  const usedPins = device.pins.map(p => p.pinNumber)
  const availablePins = ALL_PINS.filter(p => !usedPins.includes(p))

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar connected={connected} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '13px' }}>
          <Link href="/dashboard" style={{ color: '#4fa3e3', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ color: '#ccc' }}>/</span>
          <Link href={`/dashboard/room?name=${encodeURIComponent(device.room || 'General')}`} style={{ color: '#4fa3e3', textDecoration: 'none' }}>{device.room || 'General'}</Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ color: '#888' }}>{device.name}</span>
        </div>

        {error && <ErrorBar msg={error} onClose={() => setError('')} />}

        {/* Device header */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              {ICONS[device.type] || '⚙️'}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '0 0 4px' }}>{device.name}</h1>
              <div style={{ fontSize: '13px', color: '#888' }}>{device.room} · {device.deviceId}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: device.isOnline ? '#22c55e' : '#d1d5db' }} />
              <span style={{ fontSize: '12px', color: '#888' }}>{device.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* ESP32 hint */}
        <div style={{ background: '#111', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', borderLeft: '4px solid #d4f532' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#d4f532', marginBottom: '8px', letterSpacing: '0.08em' }}>ESP32 SKETCH — USE THIS DEVICE ID</div>
          <code style={{ fontSize: '13px', color: '#e5e7eb', fontFamily: 'monospace' }}>
            {`const char* deviceId = "${device.deviceId}";`}
          </code>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>Flash once in Arduino IDE. Connect to ws://YOUR_PC_IP:5000</div>
        </div>

        {/* Pins */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>
            Pins <span style={{ color: '#888', fontWeight: 400, fontSize: '13px' }}>({device.pins.length})</span>
          </h2>
          {availablePins.length > 0 && (
            <button onClick={() => { setPinForm({ pinNumber: availablePins[0], label: '' }); setShowPinModal(true) }}
              style={{ background: '#d4f532', border: 'none', borderRadius: '6px', padding: '7px 14px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', color: '#111' }}>
              + Add Pin
            </button>
          )}
        </div>

        {device.pins.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔌</div>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px' }}>No pins yet. Add a pin to control an appliance.</p>
            <button onClick={() => { setPinForm({ pinNumber: 'D0', label: '' }); setShowPinModal(true) }}
              style={{ background: '#d4f532', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              + Add Pin
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
            {device.pins.map(pin => (
              <PinCard key={pin.pinNumber} pin={pin} onToggle={() => handleToggle(pin)} onRemove={() => handleRemovePin(pin.pinNumber)} />
            ))}
          </div>
        )}
      </div>

      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '700', color: '#111' }}>Add Pin</h2>
            <label style={lbl}>Pin Number</label>
            <select value={pinForm.pinNumber} onChange={e => setPinForm(f => ({ ...f, pinNumber: e.target.value }))} style={inp}>
              {availablePins.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label style={lbl}>Label</label>
            <input value={pinForm.label} onChange={e => setPinForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Ceiling Light" style={inp} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPinModal(false)} style={{ flex: 1, padding: '10px', border: '1.5px solid #e0e0e0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' }}>Cancel</button>
              <button onClick={handleAddPin} disabled={!pinForm.label.trim()} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: pinForm.label.trim() ? '#d4f532' : '#e8e8e8', cursor: pinForm.label.trim() ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '700', color: '#111' }}>Add Pin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PinCard({ pin, onToggle, onRemove }) {
  const on = pin.state === 'ON'
  return (
    <div style={{ background: on ? '#111' : '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: on ? '2px solid #d4f532' : '2px solid transparent', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: on ? '#fff' : '#111' }}>{pin.label}</div>
          <div style={{ fontSize: '12px', color: on ? '#aaa' : '#888', marginTop: '2px' }}>{pin.pinNumber}</div>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.4, padding: '2px' }}>🗑️</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: on ? '#d4f532' : '#aaa' }}>{pin.state}</span>
        <Toggle on={on} onToggle={onToggle} />
      </div>
    </div>
  )
}

export default function DevicePage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading...</div>}>
      <DevicePageInner />
    </Suspense>
  )
}