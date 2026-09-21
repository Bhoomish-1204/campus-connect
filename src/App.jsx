import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { auth as firebaseAuth, getFirebaseUserProfile, signOutFirebase } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Opportunities from './pages/Opportunities'
import Resources from './pages/Resources'
import Events from './pages/Events'
import Applications from './pages/Applications'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Layout from './components/Layout'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Listen for Firebase auth state changes
    const unsubscribeFirebase = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!active) return
      if (fbUser) {
        setSession({ user: { id: fbUser.uid, email: fbUser.email } })
        const fbProfile = await getFirebaseUserProfile(fbUser.uid)
        setProfile(fbProfile || { id: fbUser.uid, email: fbUser.email, full_name: fbUser.displayName || fbUser.email?.split('@')[0], role: 'student' })
        setLoading(false)
      } else {
        // If not logged in via Firebase, check Supabase
        checkSupabaseSession()
      }
    })

    // Helper to check Supabase session
    async function checkSupabaseSession() {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (data.session) {
        setSession(data.session)
        await loadSupabaseProfile(data.session.user.id)
      } else {
        setSession(null)
        setProfile(null)
      }
      setLoading(false)
    }

    // Listen for Supabase auth state changes
    const { data: { subscription: supabaseSub } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (s) {
        setSession(s)
        await loadSupabaseProfile(s.user.id)
      } else if (!firebaseAuth.currentUser) {
        setSession(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribeFirebase()
      supabaseSub?.unsubscribe()
    }
  }, [])

  async function loadSupabaseProfile(id) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    setProfile(data)
  }

  async function signOut() {
    await signOutFirebase()
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <div className="splash">
        <div className="brand-mark">CC</div>
        <h2>CampusConnect</h2>
        <p>Loading your campus...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Layout profile={profile} signOut={signOut}>
      <Routes>
        <Route path="/" element={<Dashboard profile={profile} />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/events" element={<Events />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/profile" element={<Profile profile={profile} refresh={() => session?.user?.id && loadSupabaseProfile(session.user.id)} />} />
        <Route path="/admin" element={profile?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
