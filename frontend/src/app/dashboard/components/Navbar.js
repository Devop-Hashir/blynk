'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar({ userEmail, connected, onLogout, showVoice = false }) {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e8e8e8',
      padding: '0 16px', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 10, gap: '8px'
    }}>
      <style>{`
        .nb-email { display: block; }
        .nb-vtext { display: inline; }
        .nb-ltext { display: inline; }
        .nb-licon { display: none; }
        .nb-vicon { display: none; }
        @media(max-width:520px){
          .nb-email  { display: none !important; }
          .nb-vtext  { display: none !important; }
          .nb-ltext  { display: none !important; }
          .nb-licon  { display: inline !important; }
          .nb-vicon  { display: inline !important; }
        }
      `}</style>

      {/* Logo */}
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
       <Image src={"/favicon.png"} height={32} width={32} alt='Logo'/>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>

        {/* Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connected ? '#22c55e' : '#d1d5db'
          }} />
          <span style={{ fontSize: '11px', color: '#888' }}>{connected ? 'Live' : 'Off'}</span>
        </div>

        {/* Email — hidden on mobile */}
        {userEmail && (
          <span className="nb-email" style={{
            fontSize: '12px', color: '#888',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', maxWidth: '150px'
          }}>
            {userEmail}
          </span>
        )}

        {/* Voice link */}
        {showVoice && (
          <Link href="/dashboard/voice" style={{
            fontSize: '13px', color: '#555', textDecoration: 'none',
            padding: '5px 10px', border: '1.5px solid #e0e0e0',
            borderRadius: '6px', flexShrink: 0
          }}>
            🎙️<span className="nb-vtext"> Voice</span>
          </Link>
        )}

        {/* Logout button — shows text on desktop, icon on mobile */}
        {onLogout && (
          <button onClick={onLogout} style={{
            background: 'none', border: '1.5px solid #e0e0e0',
            borderRadius: '6px', padding: '5px 10px',
            fontSize: '13px', cursor: 'pointer', color: '#555', flexShrink: 0
          }}>
            <span className="nb-ltext">Logout</span>
            <span className="nb-licon">↩</span>
          </button>
        )}

      </div>
    </div>
  )
}