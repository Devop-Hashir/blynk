'use client'
import Link from 'next/link'

export default function Navbar({ userEmail, connected, onLogout, showVoice = false }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: '#d4f532', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
          <span style={{ fontWeight: '900', fontSize: '20px', color: '#000' }}>B</span>
        </div>
        <span style={{ fontWeight: '700', fontSize: '18px', color: '#111' }}>Blynk</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#22c55e' : '#d1d5db' }} />
          <span style={{ fontSize: '12px', color: '#888' }}>{connected ? 'Live' : 'Connecting...'}</span>
        </div>
        {userEmail && <span style={{ fontSize: '13px', color: '#888' }}>{userEmail}</span>}
        {showVoice && (
          <Link href="/dashboard/voice" style={{ fontSize: '13px', color: '#555', textDecoration: 'none', padding: '6px 14px', border: '1.5px solid #e0e0e0', borderRadius: '6px' }}>
            🎙️ Voice
          </Link>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{ background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>
            Logout
          </button>
        )}
      </div>
    </div>
  )
}