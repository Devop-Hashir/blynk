'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/app/lib/api'

export default function VoiceCommandsPage() {
  const [commands, setCommands] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCmd, setEditCmd] = useState(null)
  const [form, setForm] = useState({ phrase: '', deviceId: '', pinNumber: '', action: 'ON' })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [cmds, devs] = await Promise.all([api.getVoiceCommands(), api.getDevices()])
      setCommands(cmds)
      setDevices(devs)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // when device changes in form, reset pin
  const selectedDevice = devices.find(d => d.deviceId === form.deviceId)
  const availablePins = selectedDevice?.pins || []

  const openAdd = () => {
    setForm({ phrase: '', deviceId: '', pinNumber: '', action: 'ON' })
    setEditCmd(null)
    setShowModal(true)
  }

  const openEdit = (cmd) => {
    setForm({ phrase: cmd.phrase, deviceId: cmd.deviceId, pinNumber: cmd.pinNumber, action: cmd.action })
    setEditCmd(cmd)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.phrase.trim() || !form.deviceId || !form.pinNumber) return
    const device = devices.find(d => d.deviceId === form.deviceId)
    const pin = device?.pins.find(p => p.pinNumber === form.pinNumber)
    const body = {
      phrase: form.phrase,
      deviceId: form.deviceId,
      deviceName: device?.name || form.deviceId,
      pinNumber: form.pinNumber,
      pinLabel: pin?.label || form.pinNumber,
      action: form.action,
    }
    try {
      if (editCmd) await api.updateVoiceCommand(editCmd._id, body)
      else await api.addVoiceCommand(body)
      await load()
      setShowModal(false)
    } catch (e) { setError(e.message) }
  }

  const handleDelete = async (id) => {
    try { await api.deleteVoiceCommand(id); setCommands(prev => prev.filter(c => c._id !== id)) }
    catch (e) { setError(e.message) }
  }

  const canSave = form.phrase.trim() && form.deviceId && form.pinNumber

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#d4f532', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
            <span style={{ fontWeight: '900', fontSize: '20px' }}>B</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#111' }}>Blynk</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: '13px', color: '#4fa3e3', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#cc0000', display: 'flex', justifyContent: 'space-between' }}>
            {error}
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', fontWeight: '700' }}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111', margin: '0 0 4px' }}>🎙️ Voice Commands</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              Create custom phrases to control your devices by voice.
            </p>
          </div>
          <button onClick={openAdd} style={{ background: '#d4f532', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', color: '#111' }}>
            + Add Command
          </button>
        </div>

        {/* How it works */}
        <div style={{ background: '#111', borderRadius: '12px', padding: '18px 22px', margin: '24px 0', borderLeft: '4px solid #d4f532' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#d4f532', marginBottom: '8px', letterSpacing: '0.06em' }}>HOW IT WORKS</div>
          <div style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.7 }}>
            1. Add a command with a phrase you&apos;ll say, e.g. <code style={{ background: '#222', padding: '1px 6px', borderRadius: '4px' }}>turn on fan</code><br />
            2. Link it to a device pin and set the action (ON or OFF)<br />
            3. Click the 🎙️ mic button in any room page and say your phrase<br />
            4. The device will respond instantly
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>}

        {!loading && commands.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '56px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>🎙️</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>No voice commands yet</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>
              Add your first command to start controlling devices by voice.
            </p>
            <button onClick={openAdd} style={{ background: '#d4f532', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              + Add Command
            </button>
          </div>
        )}

        {!loading && commands.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {commands.map(cmd => (
              <div key={cmd._id} style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* phrase */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>🎙️</span>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#111' }}>&quot;{cmd.phrase}&quot;</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {cmd.deviceName} → {cmd.pinLabel} ({cmd.pinNumber})
                  </div>
                </div>
                {/* action badge */}
                <div style={{
                  padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px',
                  background: cmd.action === 'ON' ? '#d4f532' : '#111',
                  color: cmd.action === 'ON' ? '#111' : '#fff'
                }}>
                  {cmd.action}
                </div>
                {/* actions */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => openEdit(cmd)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.5, padding: '4px' }}>✏️</button>
                  <button onClick={() => handleDelete(cmd._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.5, padding: '4px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '700', color: '#111' }}>
              {editCmd ? 'Edit Command' : 'Add Voice Command'}
            </h2>

            <label style={lbl}>Phrase <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(what you&apos;ll say)</span></label>
            <input
              value={form.phrase}
              onChange={e => setForm(f => ({ ...f, phrase: e.target.value }))}
              placeholder='e.g. turn on the fan'
              style={inp}
            />

            <label style={lbl}>Device</label>
            <select
              value={form.deviceId}
              onChange={e => setForm(f => ({ ...f, deviceId: e.target.value, pinNumber: '' }))}
              style={inp}
            >
              <option value=''>— select device —</option>
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.name} ({d.room})</option>
              ))}
            </select>

            <label style={lbl}>Pin</label>
            <select
              value={form.pinNumber}
              onChange={e => setForm(f => ({ ...f, pinNumber: e.target.value }))}
              style={inp}
              disabled={!form.deviceId || availablePins.length === 0}
            >
              <option value=''>— select pin —</option>
              {availablePins.map(p => (
                <option key={p.pinNumber} value={p.pinNumber}>{p.label} ({p.pinNumber})</option>
              ))}
            </select>
            {form.deviceId && availablePins.length === 0 && (
              <div style={{ fontSize: '12px', color: '#e57373', marginTop: '-12px', marginBottom: '16px' }}>
                This device has no pins. Add pins first from the device page.
              </div>
            )}

            <label style={lbl}>Action</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {['ON', 'OFF'].map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, action: a }))} style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700',
                  fontSize: '14px', cursor: 'pointer',
                  background: form.action === a ? (a === 'ON' ? '#d4f532' : '#111') : '#f0f0f0',
                  color: form.action === a ? (a === 'ON' ? '#111' : '#fff') : '#888'
                }}>{a}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1.5px solid #e0e0e0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' }}>Cancel</button>
              <button onClick={handleSave} disabled={!canSave} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: canSave ? '#d4f532' : '#e8e8e8', cursor: canSave ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '700', color: '#111' }}>
                {editCmd ? 'Save' : 'Add Command'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }
const inp = { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', color: '#333', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', background: '#fff' }
