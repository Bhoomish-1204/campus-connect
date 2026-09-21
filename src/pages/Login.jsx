import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { loginWithGoogleFirebase } from '../lib/firebase'
import { Mail, Lock, ArrowRight, Chrome } from 'lucide-react'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    
    if (result.error) setError(result.error.message)
    else if (mode === 'signup') setError('Check your email to confirm your account, then sign in.')
    setBusy(false)
  }

  async function google() {
    setBusy(true)
    setError('')
    try {
      // First try Firebase Google popup sign-in
      await loginWithGoogleFirebase()
    } catch (firebaseErr) {
      console.warn('Firebase Google Auth failed, trying Supabase Google Auth:', firebaseErr)
      // Fallback to Supabase Google OAuth sign-in
      const { error: supabaseErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (supabaseErr) {
        setError(
          firebaseErr?.message || supabaseErr?.message || 'Google Auth is not enabled in Firebase/Supabase Console yet.'
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="visual-inner">
          <span className="eyebrow">BUILT FOR STUDENTS</span>
          <h1>Everything you need to move forward.</h1>
          <p>Find opportunities, discover useful resources, join events and keep every application in one place.</p>
          <div className="visual-cards">
            <div><b>324+</b><span>Opportunities</span></div>
            <div><b>890+</b><span>Resources</span></div>
            <div><b>76</b><span>Campus events</span></div>
          </div>
        </div>
      </div>
      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="brand auth-brand"><span className="brand-mark">CC</span> CampusConnect</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">{mode === 'login' ? 'Sign in to continue to your student dashboard.' : 'Join your campus community today.'}</p>
          <button className="google-btn" onClick={google} disabled={busy}>
            <Chrome size={18} /> Continue with Google
          </button>
          <div className="divider"><span>or continue with email</span></div>
          <form onSubmit={submit}>
            {mode === 'signup' && (
              <label>Full name
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
              </label>
            )}
            <label>Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@college.edu" />
            </label>
            <label>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
            </label>
            {error && <div className="alert">{error}</div>}
            <button className="primary full" disabled={busy}>
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} />
            </button>
          </form>
          <p className="switch">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
