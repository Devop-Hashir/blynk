'use client'

export default function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '36px 32px', width: '100%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗑️</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>Delete?</h2>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 28px', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', border: '1.5px solid #e0e0e0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '8px', background: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#fff' }}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}