'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, getUserId } from '@/app/lib/api'
import { useSocket } from '@/app/hooks/useSocket'
import useVoice from '@/app/hooks/useVoice'
import Navbar from '../components/Navbar'
import Toggle from '../components/Toggle'
import ErrorBar from '../components/ErrorBar'
import DeleteModal from '../components/DeleteModel'
import { inp, lbl, btnPrimary } from '../styles/common'

const ICONS = { light: '💡', fan: '🌀', ac: '❄️', tv: '📺', plug: '🔌', door: '🚪', other: '⚙️' }
const TYPES = ['light', 'fan', 'ac', 'tv', 'plug', 'door', 'other']

function RoomPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('name') || ''

  const [userId, setUserId] = useState(null)
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'light', deviceId: '', room: '' })
  const [editDeviceId, setEditDeviceId] = useState(null)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { socket, connected, controlPin, isDeviceOnline } = useSocket(userId)

  const [voiceCommands, setVoiceCommands] = useState([])
  useEffect(() => {
    api.getVoiceCommands().then(setVoiceCommands).catch(() => {})
  }, [])

  const handleVoiceMatch = useCallback(async (deviceId, pinNumber, action) => {
    setDevices(prev => prev.map(d => d.deviceId !== deviceId ? d : {
      ...d, pins: d.pins.map(p => p.pinNumber === pinNumber ? { ...p, state: action } : p)
    }))
    controlPin(deviceId, pinNumber, action)
    try { await api.controlPin({ deviceId, pin: pinNumber, state: action }) } catch {}
  }, [controlPin])

  const { listening, transcript, feedback, startListening, stopListening, isSupported } = useVoice({
    voiceCommands,
    onMatch: handleVoiceMatch,
  })

  useEffect(() => { setUserId(getUserId()) }, [])

  const loadDevices = useCallback(async () => {
    if (!roomName) return
    try {
      const all = await api.getDevices()
      setDevices(all.filter(d => d.room === roomName))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [roomName])

  useEffect(() => { loadDevices() }, [loadDevices])

  useEffect(() => {
    if (!socket) return

    const onStatus = ({ deviceId, pin, state }) => {
      setDevices(prev => prev.map(d => d.deviceId !== deviceId ? d : {
        ...d, pins: d.pins.map(p => p.pinNumber === pin ? { ...p, state } : p)
      }))
    }

    socket.on('status_update', onStatus)
    return () => {
      socket.off('status_update', onStatus)
    }
  }, [socket])

  const handleToggle = async (device, pin) => {
    const newState = pin.state === 'ON' ? 'OFF' : 'ON'
    setDevices(prev => prev.map(d => d.deviceId !== device.deviceId ? d : {
      ...d, pins: d.pins.map(p => p.pinNumber === pin.pinNumber ? { ...p, state: newState } : p)
    }))
    controlPin(device.deviceId, pin.pinNumber, newState)
    try { await api.controlPin({ deviceId: device.deviceId, pin: pin.pinNumber, state: newState }) } catch {}
  }

  const openAdd = () => { setForm({ name: '', type: 'light', deviceId: '', room: roomName }); setEditDeviceId(null); setShowModal(true) }
  const openEdit = (d) => { setForm({ name: d.name, type: d.type, deviceId: d.deviceId, room: d.room }); setEditDeviceId(d.deviceId); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.deviceId.trim()) return
    try {
      if (editDeviceId) {
        await api.updateDevice(editDeviceId, { name: form.name, type: form.type, room: form.room || roomName })
      } else {
        await api.addDevice({ name: form.name, type: form.type, deviceId: form.deviceId, room: form.room || roomName })
      }
      await loadDevices()
      setShowModal(false)
    } catch (e) { setError(e.message) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.deleteDevice(deleteTarget.deviceId)
      setDevices(prev => prev.filter(d => d.deviceId !== deleteTarget.deviceId))
    } catch (e) { setError(e.message) }
    finally { setDeleteTarget(null) }
  }

  const activeCount = devices.reduce((a, d) => a + d.pins.filter(p => p.state === 'ON').length, 0)
  // ← use isDeviceOnline from socket hook
  const onlineCount = devices.filter(d => isDeviceOnline(d.deviceId)).length

  if (!roomName) { router.push('/dashboard'); return null }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar connected={connected} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '13px' }}>
          <Link href="/dashboard" style={{ color: '#4fa3e3', textDecoration: 'none' }}>← Dashboard</Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ color: '#888' }}>{roomName}</span>
        </div>

        {error && <ErrorBar msg={error} onClose={() => setError('')} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111', margin: '0 0 4px' }}>{roomName}</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              {devices.length} device{devices.length !== 1 ? 's' : ''} · {activeCount} active · {onlineCount} online
            </p>
          </div>
          <button onClick={openAdd} style={{ background: '#d4f532', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', color: '#111' }}>
            + Add Device
          </button>
        </div>

        {/* Voice bar */}
        {isSupported && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '14px 20px', marginBottom: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={listening ? stopListening : startListening}
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0, background: listening ? '#ff4444' : '#d4f532', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: listening ? '0 0 0 6px rgba(255,68,68,0.15)' : '0 2px 6px rgba(0,0,0,0.1)', animation: listening ? 'pulse 1.5s infinite' : 'none', transition: 'all 0.2s' }}
            >
              {listening ? '⏹' : '🎙️'}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              {feedback ? (
                <div style={{ fontSize: '13px', color: feedback.startsWith('✅') ? '#16a34a' : feedback.startsWith('❌') ? '#cc0000' : '#555', fontWeight: feedback.startsWith('✅') ? '600' : '400' }}>
                  {feedback}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#aaa' }}>Press mic and say a voice command</div>
              )}
              {transcript && <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>Heard: {transcript}</div>}
            </div>
            <Link href="/dashboard/voice" style={{ fontSize: '12px', color: '#4fa3e3', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Manage commands →
            </Link>
          </div>
        )}

        <style>{`@keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(255,68,68,0.4)} 70%{box-shadow:0 0 0 10px rgba(255,68,68,0)} 100%{box-shadow:0 0 0 0 rgba(255,68,68,0)} }`}</style>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading...</div>}

        {!loading && devices.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>🔌</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>No devices in this room</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>Add your ESP32 device to start controlling appliances.</p>
            <button onClick={openAdd} style={{ background: '#d4f532', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>+ Add Device</button>
          </div>
        )}

        {!loading && devices.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '18px' }}>
            {devices.map(device => (
              <DeviceCard
                key={device._id}
                device={device}
                isOnline={isDeviceOnline(device.deviceId)}
                onToggle={pin => handleToggle(device, pin)}
                onEdit={() => openEdit(device)}
                onDelete={() => setDeleteTarget({ deviceId: device.deviceId, name: device.name })}
                onManage={() => router.push(`/dashboard/device?id=${device.deviceId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && <DeviceModal form={form} setForm={setForm} onSave={handleSave} onClose={() => setShowModal(false)} isEdit={!!editDeviceId} roomName={roomName} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading...</div>}>
      <RoomPageInner />
    </Suspense>
  )
}

function DeviceCard({ device, isOnline, onToggle, onEdit, onDelete, onManage }) {
  const anyOn = device.pins.some(p => p.state === 'ON')
  return (
    <div style={{ background: anyOn ? '#111' : '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: anyOn ? '2px solid #d4f532' : '2px solid transparent', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', background: anyOn ? '#222' : '#f5f5f5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            {ICONS[device.type] || '⚙️'}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: anyOn ? '#fff' : '#111' }}>{device.name}</div>
            <div style={{ fontSize: '11px', color: anyOn ? '#aaa' : '#888', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {device.deviceId}
              {/* ← uses isOnline prop from socket hook */}
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#d1d5db', display: 'inline-block' }} title={isOnline ? 'Online' : 'Offline'} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.4, padding: '4px' }}>✏️</button>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.4, padding: '4px' }}>🗑️</button>
        </div>
      </div>

      {device.pins.length === 0 ? (
        <div style={{ fontSize: '12px', color: anyOn ? '#555' : '#bbb', marginBottom: '14px', fontStyle: 'italic' }}>No pins yet — click Manage to add</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {device.pins.map(pin => (
            <div key={pin.pinNumber} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: anyOn ? '#ddd' : '#333' }}>{pin.label}</span>
                <span style={{ fontSize: '11px', color: '#888', marginLeft: '6px' }}>({pin.pinNumber})</span>
              </div>
              <Toggle on={pin.state === 'ON'} onToggle={() => onToggle(pin)} />
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${anyOn ? '#2a2a2a' : '#f0f0f0'}`, paddingTop: '12px' }}>
        <button onClick={onManage} style={{ width: '100%', padding: '8px', background: anyOn ? '#1a1a1a' : '#f5f5f5', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: anyOn ? '#d4f532' : '#333' }}>
          Manage Pins →
        </button>
      </div>
    </div>
  )
}

function DeviceModal({ form, setForm, onSave, onClose, isEdit, roomName }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const canSave = form.name.trim() && form.deviceId.trim()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '700', color: '#111' }}>{isEdit ? 'Edit Device' : 'Add Device'}</h2>

        <label style={lbl}>Device Name</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Living Room ESP32" style={inp} />

        <label style={lbl}>Type</label>
        <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
          {TYPES.map(t => <option key={t} value={t}>{ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        <label style={lbl}>ESP32 ID</label>
        <input value={form.deviceId} onChange={e => set('deviceId', e.target.value.trim())} placeholder="e.g. esp32-home-01" style={{ ...inp, fontFamily: 'monospace' }} />
        <div style={{ background: '#f7f7f7', borderRadius: '8px', padding: '12px 14px', marginTop: '-10px', marginBottom: '20px', fontSize: '11px', color: '#666', lineHeight: 1.8, borderLeft: '3px solid #d4f532' }}>
          <strong>📌 Flash this once in Arduino IDE:</strong><br />
          <code style={{ color: '#333' }}>const char* deviceId = "esp32-home-01";</code><br />
          One ESP32 = one fixed ID. Add multiple devices using same ID.
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1.5px solid #e0e0e0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' }}>Cancel</button>
          <button onClick={onSave} disabled={!canSave} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: canSave ? '#d4f532' : '#e8e8e8', cursor: canSave ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '700', color: '#111' }}>
            {isEdit ? 'Save' : 'Add Device'}
          </button>
        </div>
      </div>
    </div>
  )
}