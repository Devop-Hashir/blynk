'use client'
import { useEffect, useState } from 'react'

export default function VoiceButton({ listening, onStart, onStop, feedback, transcript }) {
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
    }
  }, [])

  if (!supported) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

      {/* Mic button */}
      <button
        onClick={listening ? onStop : onStart}
        style={{
          width: '52px', height: '52px', borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: listening ? '#ff4444' : '#d4f532',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', transition: 'all 0.2s',
          boxShadow: listening ? '0 0 0 6px rgba(255,68,68,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
          animation: listening ? 'pulse 1.5s infinite' : 'none',
        }}
        title={listening ? 'Stop listening' : 'Start voice control'}
      >
        {listening ? '⏹' : '🎙️'}
      </button>

      {/* Transcript */}
      {transcript && (
        <div style={{
          background: '#f5f5f5', borderRadius: '8px',
          padding: '6px 12px', fontSize: '12px', color: '#555',
          maxWidth: '200px', textAlign: 'center'
        }}>
          {transcript}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          background: feedback.startsWith('✅') ? '#f0fff0' : feedback.startsWith('❌') ? '#fff0f0' : '#fffbe6',
          border: `1px solid ${feedback.startsWith('✅') ? '#b7f5b7' : feedback.startsWith('❌') ? '#ffc0c0' : '#ffe58f'}`,
          borderRadius: '8px', padding: '6px 12px',
          fontSize: '12px', color: '#333',
          maxWidth: '220px', textAlign: 'center'
        }}>
          {feedback}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,68,68,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(255,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,68,68,0); }
        }
      `}</style>
    </div>
  )
}