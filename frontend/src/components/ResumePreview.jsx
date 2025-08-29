import { useState, useEffect } from 'react'
import { Download, RefreshCw } from 'lucide-react'

const ResumePreview = ({ resumeData }) => {
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const generatePreview = async () => {
        if (!resumeData) return
        
        setLoading(true)
        setError(null)
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL
            if (!apiUrl) {
                throw new Error('API URL not configured')
            }

            // Generate LaTeX preview using the same endpoint as PDF
            const response = await fetch(`${apiUrl}/compile-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeData,
                    resumeTitle: 'Preview',
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Preview generation failed: ${errorText}`)
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            setPreviewUrl(url)
            
        } catch (err) {
            console.error('Preview generation error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Only cleanup function to revoke object URL when component unmounts
    useEffect(() => {
        // Generate initial preview when component first loads
        if (resumeData && !previewUrl) {
            generatePreview()
        }
        
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [])

    if (!resumeData) return null

    return (
        <div className="bg-gray-100 p-6 rounded-lg">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Preview</h3>
                    <p className="text-sm text-gray-600">
                        This preview shows the exact LaTeX-compiled output that will be in your PDF
                    </p>
                </div>
                
                <button
                    onClick={generatePreview}
                    disabled={loading}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Generating...' : 'Refresh'}</span>
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {loading && (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                            <p className="text-gray-600">Generating LaTeX preview...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-6 text-center">
                        <div className="text-red-600 mb-4">
                            <p className="font-medium">Preview generation failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button
                            onClick={generatePreview}
                            className="btn-primary text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {previewUrl && !loading && !error && (
                    <div className="w-full">
                        <iframe
                            src={previewUrl}
                            className="w-full min-h-[800px] border-0"
                            title="Resume Preview"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResumePreview