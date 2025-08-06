const ResumePreview = ({ resumeData }) => {
    if (!resumeData) return null

    const { layout, sections } = resumeData

    const previewStyle = {
        fontFamily: 'Times, serif',
        backgroundColor: 'white',
        padding: `${layout.margins.top}mm ${layout.margins.right}mm ${layout.margins.bottom}mm ${layout.margins.left}mm`,
        minHeight: '297mm', // A4 height
        maxWidth: '210mm', // A4 width
        margin: '0 auto',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        lineHeight: '1.2',
    }

    const nameStyle = {
        fontSize: `${layout.fonts.nameSize}pt`,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: `${layout.spacing.itemSpacing}pt`,
        color: '#000',
    }

    const contactStyle = {
        fontSize: `${layout.fonts.contentSize}pt`,
        textAlign: 'center',
        marginBottom: `${layout.spacing.sectionSpacing}pt`,
        color: '#000',
    }

    const sectionHeaderStyle = {
        fontSize: `${layout.fonts.sectionSize}pt`,
        fontWeight: 'bold',
        marginTop: `${layout.spacing.sectionSpacing}pt`,
        marginBottom: `${layout.spacing.itemSpacing}pt`,
        borderBottom: '1px solid #000',
        paddingBottom: '2pt',
        color: '#000',
    }

    const contentStyle = {
        fontSize: `${layout.fonts.contentSize}pt`,
        marginBottom: `${layout.spacing.itemSpacing}pt`,
        color: '#000',
    }

    const formatContactInfo = (personal) => {
        const parts = []
        if (personal.phone) parts.push(personal.phone)
        if (personal.email) parts.push(personal.email)
        if (personal.location) parts.push(personal.location)
        if (personal.website) parts.push(personal.website)
        return parts.join(' • ')
    }

    return (
        <div className="bg-gray-100 p-6 rounded-lg">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Preview</h3>
                <p className="text-sm text-gray-600">This is how your resume will look when exported to PDF</p>
            </div>

            <div style={previewStyle} className="bg-white shadow-lg">
                {/* Header */}
                <div>
                    <div style={nameStyle}>
                        {sections.personal.name || 'Your Name'}
                    </div>
                    <div style={contactStyle}>
                        {formatContactInfo(sections.personal)}
                    </div>
                </div>

                {/* Experience Section */}
                {sections.experience && sections.experience.length > 0 && (
                    <div>
                        <div style={sectionHeaderStyle}>EXPERIENCE</div>
                        {sections.experience.map((exp, index) => (
                            <div key={index} style={{ ...contentStyle, marginBottom: `${layout.spacing.itemSpacing * 1.5}pt` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>{exp.title} - {exp.company}</span>
                                    <span>{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div style={{ fontStyle: 'italic', marginBottom: `${layout.spacing.itemSpacing / 2}pt` }}>
                                    {exp.location}
                                </div>
                                <ul style={{ marginLeft: '15pt', paddingLeft: '0' }}>
                                    {exp.bullets.map((bullet, bulletIndex) => (
                                        <li key={bulletIndex} style={{ marginBottom: `${layout.spacing.itemSpacing / 3}pt` }}>
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Education Section */}
                {sections.education && sections.education.length > 0 && (
                    <div>
                        <div style={sectionHeaderStyle}>EDUCATION</div>
                        {sections.education.map((edu, index) => (
                            <div key={index} style={{ ...contentStyle, marginBottom: `${layout.spacing.itemSpacing}pt` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>{edu.degree}</span>
                                    <span>{edu.graduationDate}</span>
                                </div>
                                <div>
                                    {edu.school}, {edu.location}
                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills Section */}
                {sections.skills && sections.skills.length > 0 && (
                    <div>
                        <div style={sectionHeaderStyle}>SKILLS</div>
                        <div style={contentStyle}>
                            {sections.skills.map((skill, index) => (
                                <div key={index} style={{ marginBottom: `${layout.spacing.itemSpacing / 2}pt` }}>
                                    <strong>{skill.split(',')[0].split(':')[0]}:</strong> {skill.split(',').slice(1).join(',') || skill.split(':').slice(1).join(':')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResumePreview