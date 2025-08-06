import { useState } from 'react'
import {
    User,
    Briefcase,
    GraduationCap,
    Code,
    Plus,
    Minus,
    ChevronDown,
    ChevronRight,
    Settings as SettingsIcon,
    Type,
    MoveVertical
} from 'lucide-react'

const EditorSidebar = ({
    resumeData,
    onUpdate,
    resumeTitle,
    onTitleUpdate,
    showSettings,
    onToggleSettings
}) => {
    const [expandedSections, setExpandedSections] = useState({
        personal: true,
        experience: true,
        education: true,
        skills: true,
    })

    const [editingTitle, setEditingTitle] = useState(false)
    const [titleValue, setTitleValue] = useState(resumeTitle)

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const updateSection = (section, data) => {
        onUpdate({
            ...resumeData,
            sections: {
                ...resumeData.sections,
                [section]: data
            }
        })
    }

    const updateLayout = (layoutData) => {
        onUpdate({
            ...resumeData,
            layout: {
                ...resumeData.layout,
                ...layoutData
            }
        })
    }

    const addExperience = () => {
        const newExp = {
            title: 'Job Title',
            company: 'Company Name',
            location: 'City, State',
            startDate: '2023',
            endDate: 'Present',
            bullets: ['Describe your responsibilities and achievements']
        }
        updateSection('experience', [...resumeData.sections.experience, newExp])
    }

    const removeExperience = (index) => {
        const newExp = resumeData.sections.experience.filter((_, i) => i !== index)
        updateSection('experience', newExp)
    }

    const updateExperience = (index, field, value) => {
        const newExp = resumeData.sections.experience.map((exp, i) =>
            i === index ? { ...exp, [field]: value } : exp
        )
        updateSection('experience', newExp)
    }

    const addEducation = () => {
        const newEdu = {
            degree: 'Degree Name',
            school: 'School Name',
            location: 'City, State',
            graduationDate: '2023',
            gpa: ''
        }
        updateSection('education', [...resumeData.sections.education, newEdu])
    }

    const removeEducation = (index) => {
        const newEdu = resumeData.sections.education.filter((_, i) => i !== index)
        updateSection('education', newEdu)
    }

    const updateEducation = (index, field, value) => {
        const newEdu = resumeData.sections.education.map((edu, i) =>
            i === index ? { ...edu, [field]: value } : edu
        )
        updateSection('education', newEdu)
    }

    const addSkillCategory = () => {
        updateSection('skills', [...resumeData.sections.skills, 'New skill category'])
    }

    const removeSkillCategory = (index) => {
        const newSkills = resumeData.sections.skills.filter((_, i) => i !== index)
        updateSection('skills', newSkills)
    }

    const updateSkillCategory = (index, value) => {
        const newSkills = resumeData.sections.skills.map((skill, i) =>
            i === index ? value : skill
        )
        updateSection('skills', newSkills)
    }

    const handleTitleSave = () => {
        if (titleValue.trim() && titleValue !== resumeTitle) {
            onTitleUpdate(titleValue.trim())
        }
        setEditingTitle(false)
    }

    const renderPersonalSection = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        className="input-field text-sm"
                        value={resumeData.sections.personal.name}
                        onChange={(e) => updateSection('personal', {
                            ...resumeData.sections.personal,
                            name: e.target.value
                        })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="input-field text-sm"
                        value={resumeData.sections.personal.email}
                        onChange={(e) => updateSection('personal', {
                            ...resumeData.sections.personal,
                            email: e.target.value
                        })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                        type="text"
                        className="input-field text-sm"
                        value={resumeData.sections.personal.phone}
                        onChange={(e) => updateSection('personal', {
                            ...resumeData.sections.personal,
                            phone: e.target.value
                        })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        className="input-field text-sm"
                        value={resumeData.sections.personal.location}
                        onChange={(e) => updateSection('personal', {
                            ...resumeData.sections.personal,
                            location: e.target.value
                        })}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website/LinkedIn</label>
                <input
                    type="text"
                    className="input-field text-sm"
                    value={resumeData.sections.personal.website}
                    onChange={(e) => updateSection('personal', {
                        ...resumeData.sections.personal,
                        website: e.target.value
                    })}
                />
            </div>
        </div>
    )

    const renderExperienceSection = () => (
        <div className="space-y-6">
            {resumeData.sections.experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                        <button
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={exp.title}
                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={exp.location}
                                onChange={(e) => updateExperience(index, 'location', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Responsibilities</label>
                        <div className="space-y-2">
                            {exp.bullets.map((bullet, bulletIndex) => (
                                <div key={bulletIndex} className="flex items-start space-x-2">
                                    <textarea
                                        className="input-field text-sm flex-1 min-h-[60px] resize-none"
                                        value={bullet}
                                        onChange={(e) => {
                                            const newBullets = [...exp.bullets]
                                            newBullets[bulletIndex] = e.target.value
                                            updateExperience(index, 'bullets', newBullets)
                                        }}
                                        placeholder="Describe your responsibilities and achievements..."
                                    />
                                    <button
                                        onClick={() => {
                                            const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex)
                                            updateExperience(index, 'bullets', newBullets)
                                        }}
                                        className="text-red-600 hover:text-red-800 p-1 mt-1"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateExperience(index, 'bullets', [...exp.bullets, 'New responsibility'])}
                                className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1"
                            >
                                <Plus className="h-3 w-3" />
                                <span>Add bullet point</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addExperience}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
                <Plus className="h-4 w-4" />
                <span>Add Experience</span>
            </button>
        </div>
    )

    const renderEducationSection = () => (
        <div className="space-y-6">
            {resumeData.sections.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                        <button
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Degree</label>
                        <input
                            type="text"
                            className="input-field text-sm"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="e.g., Bachelor of Science in Computer Science"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">School</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={edu.school}
                                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                placeholder="University Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={edu.location}
                                onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                placeholder="City, State"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Graduation Date</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={edu.graduationDate}
                                onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                                placeholder="May 2023"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">GPA (Optional)</label>
                            <input
                                type="text"
                                className="input-field text-sm"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                placeholder="3.8"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addEducation}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
                <Plus className="h-4 w-4" />
                <span>Add Education</span>
            </button>
        </div>
    )

    const renderSkillsSection = () => (
        <div className="space-y-4">
            <div className="text-xs text-gray-600 mb-2">
                Tip: Use format "Category: skill1, skill2, skill3" or just list skills
            </div>
            {resumeData.sections.skills.map((skill, index) => (
                <div key={index} className="flex items-start space-x-2">
                    <textarea
                        className="input-field text-sm flex-1 min-h-[40px] resize-none"
                        value={skill}
                        onChange={(e) => updateSkillCategory(index, e.target.value)}
                        placeholder="e.g., Programming: JavaScript, Python, React or just JavaScript, Python, React"
                    />
                    <button
                        onClick={() => removeSkillCategory(index)}
                        className="text-red-600 hover:text-red-800 p-1 mt-1"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                </div>
            ))}

            <button
                onClick={addSkillCategory}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
                <Plus className="h-4 w-4" />
                <span>Add Skill Category</span>
            </button>
        </div>
    )

    const renderSettingsSection = () => (
        <div className="space-y-6">
            {/* Font Sizes */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <Type className="h-4 w-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Typography</h4>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name Size</label>
                        <input
                            type="range"
                            min="18"
                            max="32"
                            className="w-full accent-primary-600"
                            value={resumeData.layout.fonts.nameSize}
                            onChange={(e) => updateLayout({
                                fonts: { ...resumeData.layout.fonts, nameSize: parseInt(e.target.value) }
                            })}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>18pt</span>
                            <span className="font-medium">{resumeData.layout.fonts.nameSize}pt</span>
                            <span>32pt</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Section Headers</label>
                        <input
                            type="range"
                            min="10"
                            max="18"
                            className="w-full accent-primary-600"
                            value={resumeData.layout.fonts.sectionSize}
                            onChange={(e) => updateLayout({
                                fonts: { ...resumeData.layout.fonts, sectionSize: parseInt(e.target.value) }
                            })}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>10pt</span>
                            <span className="font-medium">{resumeData.layout.fonts.sectionSize}pt</span>
                            <span>18pt</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Content Size</label>
                        <input
                            type="range"
                            min="9"
                            max="14"
                            className="w-full accent-primary-600"
                            value={resumeData.layout.fonts.contentSize}
                            onChange={(e) => updateLayout({
                                fonts: { ...resumeData.layout.fonts, contentSize: parseInt(e.target.value) }
                            })}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>9pt</span>
                            <span className="font-medium">{resumeData.layout.fonts.contentSize}pt</span>
                            <span>14pt</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacing */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <MoveVertical className="h-4 w-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Spacing</h4>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Section Spacing</label>
                        <input
                            type="range"
                            min="6"
                            max="20"
                            className="w-full accent-primary-600"
                            value={resumeData.layout.spacing.sectionSpacing}
                            onChange={(e) => updateLayout({
                                spacing: { ...resumeData.layout.spacing, sectionSpacing: parseInt(e.target.value) }
                            })}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>6pt</span>
                            <span className="font-medium">{resumeData.layout.spacing.sectionSpacing}pt</span>
                            <span>20pt</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Item Spacing</label>
                        <input
                            type="range"
                            min="2"
                            max="12"
                            className="w-full accent-primary-600"
                            value={resumeData.layout.spacing.itemSpacing}
                            onChange={(e) => updateLayout({
                                spacing: { ...resumeData.layout.spacing, itemSpacing: parseInt(e.target.value) }
                            })}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>2pt</span>
                            <span className="font-medium">{resumeData.layout.spacing.itemSpacing}pt</span>
                            <span>12pt</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Margins */}
            <div>
                <h4 className="font-medium text-gray-900 mb-3">Margins (mm)</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Top</label>
                        <input
                            type="number"
                            min="10"
                            max="50"
                            className="input-field text-sm"
                            value={resumeData.layout.margins.top}
                            onChange={(e) => updateLayout({
                                margins: { ...resumeData.layout.margins, top: parseInt(e.target.value) || 20 }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bottom</label>
                        <input
                            type="number"
                            min="10"
                            max="50"
                            className="input-field text-sm"
                            value={resumeData.layout.margins.bottom}
                            onChange={(e) => updateLayout({
                                margins: { ...resumeData.layout.margins, bottom: parseInt(e.target.value) || 20 }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Left</label>
                        <input
                            type="number"
                            min="10"
                            max="40"
                            className="input-field text-sm"
                            value={resumeData.layout.margins.left}
                            onChange={(e) => updateLayout({
                                margins: { ...resumeData.layout.margins, left: parseInt(e.target.value) || 15 }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Right</label>
                        <input
                            type="number"
                            min="10"
                            max="40"
                            className="input-field text-sm"
                            value={resumeData.layout.margins.right}
                            onChange={(e) => updateLayout({
                                margins: { ...resumeData.layout.margins, right: parseInt(e.target.value) || 15 }
                            })}
                        />
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Standard A4 margins: 20mm top/bottom, 15mm left/right
                </div>
            </div>

            {/* Reset to Defaults */}
            <div>
                <button
                    onClick={() => updateLayout({
                        margins: { top: 20, bottom: 20, left: 15, right: 15 },
                        spacing: { sectionSpacing: 12, itemSpacing: 6 },
                        fonts: { nameSize: 24, sectionSize: 14, contentSize: 11 }
                    })}
                    className="w-full btn-secondary text-sm"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    )

    const SectionHeader = ({ icon: Icon, title, isExpanded, onToggle }) => (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">{title}</span>
            </div>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
    )

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
            {/* Title Editor */}
            <div className="p-4 border-b border-gray-200">
                {editingTitle ? (
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            className="input-field text-sm flex-1"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave()
                                if (e.key === 'Escape') {
                                    setTitleValue(resumeTitle)
                                    setEditingTitle(false)
                                }
                            }}
                            autoFocus
                        />
                    </div>
                ) : (
                    <div
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        onClick={() => setEditingTitle(true)}
                    >
                        <h3 className="font-semibold text-gray-900 truncate">{resumeTitle}</h3>
                        <p className="text-xs text-gray-500">Click to edit title</p>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Personal Information */}
                <div className="space-y-2">
                    <SectionHeader
                        icon={User}
                        title="Personal Information"
                        isExpanded={expandedSections.personal}
                        onToggle={() => toggleSection('personal')}
                    />
                    {expandedSections.personal && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {renderPersonalSection()}
                        </div>
                    )}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                    <SectionHeader
                        icon={Briefcase}
                        title="Experience"
                        isExpanded={expandedSections.experience}
                        onToggle={() => toggleSection('experience')}
                    />
                    {expandedSections.experience && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {renderExperienceSection()}
                        </div>
                    )}
                </div>

                {/* Education */}
                <div className="space-y-2">
                    <SectionHeader
                        icon={GraduationCap}
                        title="Education"
                        isExpanded={expandedSections.education}
                        onToggle={() => toggleSection('education')}
                    />
                    {expandedSections.education && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {renderEducationSection()}
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="space-y-2">
                    <SectionHeader
                        icon={Code}
                        title="Skills"
                        isExpanded={expandedSections.skills}
                        onToggle={() => toggleSection('skills')}
                    />
                    {expandedSections.skills && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {renderSkillsSection()}
                        </div>
                    )}
                </div>

                {/* Settings */}
                {showSettings && (
                    <div className="space-y-2">
                        <SectionHeader
                            icon={SettingsIcon}
                            title="Layout Settings"
                            isExpanded={true}
                            onToggle={() => { }}
                        />
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {renderSettingsSection()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EditorSidebar