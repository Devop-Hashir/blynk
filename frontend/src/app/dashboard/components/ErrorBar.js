'use client'

export default function ErrorBar({ msg, onClose }) {
  return (
    <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#cc0000', display: 'flex', justifyContent: 'space-between' }}>
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', fontWeight: '700' }}>✕</button>
    </div>
  )
}