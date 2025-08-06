import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Enable JWT signing keys for better performance
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
    },
})

// Modern auth helper using getClaims() for better performance
export const getCurrentUser = async () => {
    try {
        // First check if there's an active session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
            return null
        }

        // Try to get claims first (local validation with JWT signing keys)
        const { data: claims, error: claimsError } = await supabase.auth.getClaims()

        if (claimsError || !claims) {
            // Fallback to getUser if getClaims fails
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            
            // Ensure consistent user object structure
            return {
                id: user.id,
                email: user.email,
                ...user
            }
        }

        return {
            id: claims.sub,
            email: claims.email,
            ...claims
        }
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}