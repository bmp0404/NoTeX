import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        // Listen for auth changes - this will handle both initial session and changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {

                if (!isMounted) return
                if (session?.user) {
                    setUser(session.user)
                } else {
                    setUser(null)
                }
                setLoading(false)
            }
        )

        // Get initial session to trigger the onAuthStateChange listener

        supabase.auth.getSession().then(({ data: { session } }) => {
        })
        return () => {
            isMounted = false
            subscription?.unsubscribe()
        }
    }, [])

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            setUser(null)
        }
        return { error }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}