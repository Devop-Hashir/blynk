const BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`

function getToken() {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1] || null
}

export function getUserId() {
  const token = getToken()
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1])).userId
  } catch { return null }
}

export function getUserEmail() {
  const token = getToken()
  if (!token) return ''
  try {
    return JSON.parse(atob(token.split('.')[1])).email
  } catch { return '' }
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  // rooms
  getRooms: () => request('/rooms'),
  addRoom: (body) => request('/rooms/add', { method: 'POST', body: JSON.stringify(body) }),
  updateRoom: (id, body) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
  // devices
  getDevices: () => request('/devices'),
  getDevicesByRoom: (room) => request(`/devices?room=${encodeURIComponent(room)}`),
  addDevice: (body) => request('/devices/add', { method: 'POST', body: JSON.stringify(body) }),
  updateDevice: (deviceId, body) => request(`/devices/${deviceId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDevice: (deviceId) => request(`/devices/${deviceId}`, { method: 'DELETE' }),
  controlPin: (body) => request('/devices/control', { method: 'POST', body: JSON.stringify(body) }),
  addPin: (deviceId, body) => request(`/devices/${deviceId}/pins`, { method: 'POST', body: JSON.stringify(body) }),
  removePin: (deviceId, pinNumber) => request(`/devices/${deviceId}/pins/${pinNumber}`, { method: 'DELETE' }),
  // voice commands
  getVoiceCommands: () => request('/voice-commands'),
  addVoiceCommand: (body) => request('/voice-commands/add', { method: 'POST', body: JSON.stringify(body) }),
  updateVoiceCommand: (id, body) => request(`/voice-commands/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVoiceCommand: (id) => request(`/voice-commands/${id}`, { method: 'DELETE' }),
}
