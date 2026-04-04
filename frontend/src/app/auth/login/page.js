'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthCard from '@/app/components/AuthCard'
import AuthInput from '@/app/components/AuthInput'
import AuthButton from '@/app/components/AuthButton'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccess('Email verified! You can now log in.')
    }
    if (searchParams.get('error') === 'invalid_token') {
      setError('Verification link is invalid or has expired. Please sign up again.')
    }
  }, [searchParams])

  const handleLogin = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`
        router.push('/dashboard')
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
      <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: "700", marginBottom: "28px", color: "#111" }}>
        Log In
      </h1>

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

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link href="/auth/forgotpassword" style={{ fontSize: "13px", color: "#4fa3e3", textDecoration: "none" }}>
          Forgot password?
        </Link>
      </div>

      <AuthButton onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </AuthButton>

      <div style={{ textAlign: "center" }}>
        <Link href="/auth/signup" style={{ fontSize: "13px", color: "#4fa3e3", textDecoration: "none" }}>
          Create new account
        </Link>
      </div>
    </AuthCard>
  )
}
