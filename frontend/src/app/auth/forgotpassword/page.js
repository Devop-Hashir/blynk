'use client'
import { useState } from 'react'
import AuthButton from '@/app/components/AuthButton'
import AuthCard from '@/app/components/AuthCard'
import AuthInput from '@/app/components/AuthInput'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password reset link sent! Check your inbox.')
        setEmail('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#111" }}>
        Forgot Password
      </h1>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginBottom: "24px", lineHeight: "1.5" }}>
        {"No worries! Enter your email and we'll send a link to reset your password."}
      </p>

      {success && (
        <div style={{
          backgroundColor: "#f0fff4", border: "1px solid #b6f5c2",
          borderRadius: "6px", padding: "10px 14px",
          fontSize: "13px", color: "#1a7a3a", marginBottom: "16px",
          textAlign: "center"
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: "#fff0f0", border: "1px solid #ffcccc",
          borderRadius: "6px", padding: "10px 14px",
          fontSize: "13px", color: "#cc0000", marginBottom: "16px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <AuthInput
        id="email"
        label="Email"
        type="email"
        icon="✉"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <AuthButton onClick={handleForgotPassword} disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </AuthButton>

      <div style={{ textAlign: "center" }}>
        <Link href="/auth/login" style={{ fontSize: "13px", color: "#4fa3e3", textDecoration: "none" }}>
          Back to login
        </Link>
      </div>
    </AuthCard>
  )
}
