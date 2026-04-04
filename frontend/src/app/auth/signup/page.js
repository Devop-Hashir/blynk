'use client'
import { useState } from 'react'
import AuthButton from '@/app/components/AuthButton'
import AuthCard from '@/app/components/AuthCard'
import AuthInput from '@/app/components/AuthInput'
import Link from 'next/link'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const handleSignup = async () => {
    setError('')
    setSuccess('')

    if (!email || !password || !confirmPassword) {
      return setError('All fields are required')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (!accepted) {
      return setError('Please accept terms and conditions')
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Check your email to verify your account')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(data.message)
      }

    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#111" }}>
        Create Account
      </h1>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginBottom: "24px" }}>
        Sign up with your email and password.
      </p>

      {success && (
        <div style={{
          backgroundColor: "#f0fff4", border: "1px solid #b6f5c2",
          borderRadius: "6px", padding: "10px 14px",
          fontSize: "13px", color: "#1a7a3a", marginBottom: "16px", textAlign: "center"
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: "#fff0f0", border: "1px solid #ffcccc",
          borderRadius: "6px", padding: "10px 14px",
          fontSize: "13px", color: "#cc0000", marginBottom: "16px", textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <AuthInput id="email" label="Email" type="email" icon="✉"
        value={email} onChange={(e) => setEmail(e.target.value)} />

      <AuthInput id="password" label="Password" type="password" icon="🔒"
        value={password} onChange={(e) => setPassword(e.target.value)} />

      <AuthInput id="confirmPassword" label="Confirm Password" type="password" icon="🔒"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <input
          id="terms"
          type="checkbox"
          checked={accepted}
          onChange={() => setAccepted(!accepted)}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <label htmlFor="terms" style={{ fontSize: "13px", color: "#555", cursor: "pointer" }}>
          I agree with the{" "}
          <Link href="#" style={{ color: "#4fa3e3", textDecoration: "none" }}>terms and conditions</Link>
        </label>
      </div>

      <AuthButton onClick={handleSignup} disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </AuthButton>

      <div style={{ textAlign: "center" }}>
        <Link href="/auth/login" style={{ fontSize: "13px", color: "#4fa3e3", textDecoration: "none" }}>
          Already have an account? Log in
        </Link>
      </div>
    </AuthCard>
  )
}
