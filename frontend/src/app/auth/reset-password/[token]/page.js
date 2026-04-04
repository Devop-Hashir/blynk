'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AuthButton from '@/app/components/AuthButton'
import AuthCard from '@/app/components/AuthCard'
import AuthInput from '@/app/components/AuthInput'
import Link from 'next/link'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError('')
    setSuccess('')

    if (!password || !confirmPassword) {
      return setError('Please fill in both fields')
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password reset successful! Redirecting to login...')
        setTimeout(() => router.push('/auth/login'), 2000)
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
        Reset Password
      </h1>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginBottom: "24px", lineHeight: "1.5" }}>
        Enter your new password below.
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
        id="password"
        label="New Password"
        type="password"
        icon="🔒"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <AuthInput
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        icon="🔒"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <AuthButton onClick={handleReset} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </AuthButton>

      <div style={{ textAlign: "center" }}>
        <Link href="/auth/login" style={{ fontSize: "13px", color: "#4fa3e3", textDecoration: "none" }}>
          Back to login
        </Link>
      </div>
    </AuthCard>
  )
}
