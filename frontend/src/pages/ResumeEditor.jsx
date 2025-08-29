import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Download, ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import ResumePreview from '../components/ResumePreview'
import EditorSidebar from '../components/EditorSidebar'

const ResumeEditor = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [resume, setResume] = useState(null)
    const [resumeData, setResumeData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        fetchResumeData()
    }, [id])

    const fetchResumeData = async () => {
        try {
            // Ensure we have a user ID
            const userId = user?.id || user?.sub
            if (!userId || !id) {
                throw new Error('Invalid user or resume ID')
            }

            // Fetch resume metadata
            const { data: resumeMeta, error: resumeError } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single()

            if (resumeError) throw resumeError
            setResume(resumeMeta)

            // Fetch resume data
            const { data: data, error: dataError } = await supabase
                .from('resume_data')
                .select('*')
                .eq('resume_id', id)
                .single()

            if (dataError) throw dataError
            setResumeData(data.data)

        } catch (error) {
            toast.error('Error loading resume: ' + error.message)
            navigate('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const saveResume = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('resume_data')
                .update({
                    data: resumeData,
                    version: 1, // Simple versioning for now
                })
                .eq('resume_id', id)

            if (error) throw error

            // Update resume updated_at timestamp
            await supabase
                .from('resumes')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', id)

            toast.success('Resume saved!')
        } catch (error) {
            toast.error('Error saving resume: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const exportToPDF = async () => {
        setExporting(true)
        try {
            // Check if API URL is configured
            const apiUrl = import.meta.env.VITE_API_URL
            if (!apiUrl) {
                throw new Error('API URL not configured. Please check your environment variables.')
            }

            console.log('Exporting PDF using backend LaTeX compilation...')
            console.log('API URL:', apiUrl)
            console.log('Resume data:', resumeData)

            // First, test the data structure with debug endpoint
            try {
                const debugResponse = await fetch(`${apiUrl}/debug-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        resumeData,
                        resumeTitle: resume.title,
                    }),
                })
                
                if (debugResponse.ok) {
                    const debugData = await debugResponse.json()
                    console.log('Debug data structure:', debugData)
                } else {
                    console.warn('Debug endpoint failed, continuing with PDF export...')
                }
            } catch (debugError) {
                console.warn('Debug endpoint error:', debugError)
            }

            const response = await fetch(`${apiUrl}/compile-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeData,
                    resumeTitle: resume.title,
                }),
            })

            console.log('Response status:', response.status)
            console.log('Response headers:', response.headers)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Backend error response:', errorText)
                
                // Try to parse error details
                let errorDetail = 'Unknown error'
                try {
                    const errorData = JSON.parse(errorText)
                    errorDetail = errorData.detail || errorData.message || errorText
                } catch {
                    errorDetail = errorText
                }
                
                throw new Error(`Backend compilation failed: ${errorDetail}`)
            }

            const blob = await response.blob()
            console.log('PDF blob received, size:', blob.size, 'bytes')
            
            if (blob.size === 0) {
                throw new Error('Received empty PDF file from backend')
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${resume.title || 'resume'}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('PDF exported successfully using LaTeX compilation!')
        } catch (error) {
            console.error('PDF export error:', error)
            
            // Provide more helpful error messages
            let userMessage = 'Error exporting PDF: '
            if (error.message.includes('API URL not configured')) {
                userMessage += 'Backend not configured. Please check your environment setup.'
            } else if (error.message.includes('Backend compilation failed')) {
                userMessage += error.message.replace('Backend compilation failed: ', '')
            } else if (error.message.includes('Failed to fetch')) {
                userMessage += 'Cannot connect to backend server. Please ensure the backend is running.'
            } else {
                userMessage += error.message
            }
            
            toast.error(userMessage)
        } finally {
            setExporting(false)
        }
    }

    const updateResumeData = (newData) => {
        setResumeData(newData)
    }

    const updateResumeTitle = async (newTitle) => {
        try {
            const { error } = await supabase
                .from('resumes')
                .update({ title: newTitle })
                .eq('id', id)

            if (error) throw error

            setResume(prev => ({ ...prev, title: newTitle }))
            toast.success('Resume title updated!')
        } catch (error) {
            toast.error('Error updating title: ' + error.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!resume || !resumeData) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Resume not found or you don't have permission to edit it.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
                        <p className="text-gray-600 text-sm">
                            Last saved: {new Date(resume.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </button>

                    <button
                        onClick={saveResume}
                        disabled={saving}
                        className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                    >
                        {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>

                    <button
                        onClick={exportToPDF}
                        disabled={exporting}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                        {exporting ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4" />}
                        <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
                    </button>
                </div>
            </div>

            {/* Editor Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-screen">
                {/* Editor Sidebar */}
                <div className="space-y-6">
                    <EditorSidebar
                        resumeData={resumeData}
                        onUpdate={updateResumeData}
                        resumeTitle={resume.title}
                        onTitleUpdate={updateResumeTitle}
                        showSettings={showSettings}
                        onToggleSettings={() => setShowSettings(!showSettings)}
                    />
                </div>

                {/* Preview */}
                <div className="lg:sticky lg:top-4 lg:h-fit">
                    <ResumePreview resumeData={resumeData} />
                </div>
            </div>
        </div>
    )
}

export default ResumeEditor