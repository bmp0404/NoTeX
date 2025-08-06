import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Calendar, Edit3, Trash2, Copy } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const { user } = useAuth()

    const fetchResumes = useCallback(async () => {
        try {
            if (!user?.id) {
                throw new Error('Invalid user ID')
            }

            const { data, error } = await supabase
                .from('resumes')
                .select(`
          id,
          title,
          created_at,
          updated_at
        `)
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })

            if (error) throw error
            setResumes(data || [])
        } catch (error) {
            toast.error('Error loading resumes: ' + error.message)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (user?.id) {
            fetchResumes()
        } else if (user !== null) {
            // User exists but has no ID - stop loading
            setLoading(false)
        }
    }, [user, fetchResumes])

    const createNewResume = async () => {
        setCreating(true)
        try {
            if (!user?.id) {
                throw new Error('Invalid user ID')
            }

            // Get current resume count to generate next number
            const { count, error: countError } = await supabase
                .from('resumes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            if (countError) throw countError

            const resumeNumber = (count || 0) + 1

            // Insert new resume
            const { data, error } = await supabase
                .from('resumes')
                .upsert(
                    {
                        user_id: user.id,
                        title: `Resume ${resumeNumber}`,
                    },
                )
                .select('id, user_id, title')  // explicitly select title as well
                .single()

            if (error) throw error

            // Insert default template data
            const { error: dataError } = await supabase
                .from('resume_data')
                .insert([
                    {
                        resume_id: data.id,
                        data: getDefaultTemplate(),
                        version: 1,
                    }
                ])

            if (dataError) throw dataError

            toast.success('New resume created!')
            fetchResumes()
        } catch (error) {
            toast.error('Error creating resume: ' + error.message)
        } finally {
            setCreating(false)
        }
    }

    const duplicateResume = async (resumeId, title) => {
        try {
            if (!user?.id) {
                throw new Error('Invalid user ID')
            }

            // Get original resume data
            const { data: originalData, error: fetchError } = await supabase
                .from('resume_data')
                .select('data')
                .eq('resume_id', resumeId)
                .single()

            if (fetchError) throw fetchError

            // Create new resume
            const { data: newResume, error: resumeError } = await supabase
                .from('resumes')
                .insert([
                    {
                        user_id: user.id,
                        title: `${title} (Copy)`,
                    }
                ])
                .select()
                .single()

            if (resumeError) throw resumeError

            // Insert duplicated data
            const { error: dataError } = await supabase
                .from('resume_data')
                .insert([
                    {
                        resume_id: newResume.id,
                        data: originalData.data,
                        version: 1,
                    }
                ])

            if (dataError) throw dataError

            toast.success('Resume duplicated!')
            fetchResumes()
        } catch (error) {
            toast.error('Error duplicating resume: ' + error.message)
        }
    }

    const deleteResume = async (resumeId, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('resumes')
                .delete()
                .eq('id', resumeId)

            if (error) throw error

            toast.success('Resume deleted')
            fetchResumes()
        } catch (error) {
            toast.error('Error deleting resume: ' + error.message)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
                    <p className="text-gray-600 mt-1">Create and manage your professional resumes</p>
                </div>

                <button
                    onClick={createNewResume}
                    disabled={creating}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                    {creating ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <Plus className="h-5 w-5" />
                    )}
                    <span>New Resume</span>
                </button>
            </div>

            {/* Resume Grid */}
            {resumes.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">No resumes yet</h2>
                    <p className="text-gray-500 mb-6">Create your first professional resume to get started</p>
                    <button
                        onClick={createNewResume}
                        disabled={creating}
                        className="btn-primary flex items-center space-x-2 mx-auto disabled:opacity-50"
                    >
                        {creating ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <Plus className="h-5 w-5" />
                        )}
                        <span>Create First Resume</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary-50 rounded-lg">
                                            <FileText className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {resume.title}
                                            </h3>
                                            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>Updated {formatDate(resume.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between space-x-2">
                                    <Link
                                        to={`/resume/${resume.id}`}
                                        className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center space-x-1"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        <span>Edit</span>
                                    </Link>

                                    <button
                                        onClick={() => duplicateResume(resume.id, resume.title)}
                                        className="btn-secondary p-2"
                                        title="Duplicate"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => deleteResume(resume.id, resume.title)}
                                        className="btn-secondary p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Default resume template structure
const getDefaultTemplate = () => ({
    layout: {
        margins: {
            top: 20,
            bottom: 20,
            left: 15,
            right: 15,
        },
        spacing: {
            sectionSpacing: 12,
            itemSpacing: 6,
        },
        fonts: {
            nameSize: 24,
            sectionSize: 14,
            contentSize: 11,
        },
    },
    sections: {
        personal: {
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '(555) 123-4567',
            location: 'City, State',
            website: 'linkedin.com/in/johndoe',
        },
        experience: [
            {
                title: 'Software Engineer',
                company: 'Company Name',
                location: 'City, State',
                startDate: '2022',
                endDate: 'Present',
                bullets: [
                    'Developed and maintained web applications using React and Node.js',
                    'Collaborated with cross-functional teams to deliver high-quality software',
                    'Implemented responsive designs and optimized performance',
                ],
            },
        ],
        education: [
            {
                degree: 'Bachelor of Science in Computer Science',
                school: 'University Name',
                location: 'City, State',
                graduationDate: '2022',
                gpa: '3.8',
            },
        ],
        skills: [
            'JavaScript, Python, Java',
            'React, Node.js, Express',
            'PostgreSQL, MongoDB',
            'Git, Docker, AWS',
        ],
    },
})

export default Dashboard