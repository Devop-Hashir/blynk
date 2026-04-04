'use client'
import { useState, useRef, useCallback } from 'react'

/**
 * useVoice — matches spoken phrase against user-defined voice commands
 *
 * @param {Array} voiceCommands  — list of {phrase, deviceId, pinNumber, action, pinLabel, deviceName}
 * @param {Function} onMatch     — called with (deviceId, pinNumber, action) when a command matches
 */
export default function useVoice({ voiceCommands = [], onMatch }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const recognitionRef = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const processTranscript = useCallback((text) => {
    const lower = text.toLowerCase().trim()
    setTranscript(lower)

    if (!voiceCommands.length) {
      setFeedback('⚠️ No voice commands set up yet. Go to Voice Commands to add some.')
      return
    }

    // find best match — exact first, then partial
    const exact = voiceCommands.find(c => c.phrase === lower)
    const partial = voiceCommands.find(c => lower.includes(c.phrase) || c.phrase.includes(lower))
    const matched = exact || partial

    if (matched) {
      onMatch(matched.deviceId, matched.pinNumber, matched.action)
      setFeedback(`✅ "${matched.phrase}" → ${matched.deviceName} / ${matched.pinLabel} → ${matched.action}`)
    } else {
      setFeedback(`❓ No command matched: "${lower}"`)
    }
  }, [voiceCommands, onMatch])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setFeedback('❌ Voice not supported. Use Chrome.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setListening(true)
      setFeedback('🎙️ Listening...')
      setTranscript('')
    }

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      processTranscript(text)
    }

    recognition.onend = () => setListening(false)

    recognition.onerror = (e) => {
      setListening(false)
      if (e.error === 'no-speech') setFeedback('⚠️ No speech detected. Try again.')
      else if (e.error === 'not-allowed') setFeedback('❌ Microphone access denied.')
      else setFeedback(`❌ Error: ${e.error}`)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, processTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, transcript, feedback, startListening, stopListening, isSupported }
}
