import { Link, useNavigate } from 'react-router-dom'
import { LogOut, FileText, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Header = () => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        try {
            const { error } = await signOut()
            if (error) throw error

            toast.success('Signed out successfully')
            navigate('/login')
        } catch (error) {
            toast.error('Error signing out: ' + error.message)
        }
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <FileText className="h-8 w-8 text-primary-600" />
                        <span className="text-xl font-bold text-gray-900">LaTeX Resume</span>
                    </Link>

                    {/* User menu */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{user?.email}</span>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Sign out</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header