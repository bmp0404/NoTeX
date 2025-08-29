from pylatex import Document, Section, Command, NewLine, NewPage
from pylatex.base_classes import Environment
from pylatex.package import Package
from pylatex.utils import italic, bold, NoEscape
from models import ResumeData

class ResumeSubheading(Environment):
    """Custom environment for resume job entries"""
    _latex_name = 'tabular*'
    packages = [Package('array')]
    
    def __init__(self, title, dates, company, location, **kwargs):
        self.title = title
        self.dates = dates
        self.company = company
        self.location = location
        super().__init__(arguments=[NoEscape(r'\textwidth'), 't', NoEscape('l@{\\extracolsep{\\fill}}r')], **kwargs)
    
    def dumps_content(self, **kwargs):
        content = []
        content.append(NoEscape(f'\\textbf{{{self.title}}} & {self.dates} \\\\'))
        content.append(NoEscape(f'\\textit{{\\small {self.company}}} & \\textit{{\\small {self.location}}} \\\\'))
        return ''.join([item.dumps(**kwargs) if hasattr(item, 'dumps') else str(item) for item in content])

class ResumeEducation(Environment):
    """Custom environment for education entries"""
    _latex_name = 'tabular*'
    
    def __init__(self, degree, graduation_date, school, location, gpa="", **kwargs):
        self.degree = degree
        self.graduation_date = graduation_date
        self.school = school
        self.location = location
        self.gpa = gpa
        super().__init__(arguments=[NoEscape(r'\textwidth'), 't', NoEscape('l@{\\extracolsep{\\fill}}r')], **kwargs)
    
    def dumps_content(self, **kwargs):
        content = []
        content.append(NoEscape(f'\\textbf{{{self.degree}}} & {self.graduation_date} \\\\'))
        content.append(NoEscape(f'\\textit{{\\small {self.school}}} & \\textit{{\\small {self.location}}} \\\\'))
        if self.gpa:
            content.append(NoEscape('\\end{tabular*}'))
            content.append(NoEscape('\\vspace{-5pt}'))
            content.append(NoEscape('\\begin{tabular*}{\\textwidth}[t]{l}'))
            content.append(NoEscape(f'\\small GPA: {self.gpa} \\\\'))
        return ''.join([item.dumps(**kwargs) if hasattr(item, 'dumps') else str(item) for item in content])

def generate_latex_document(resume_data: ResumeData) -> Document:
    """Generate PyLaTeX Document from resume data"""
    layout = resume_data.layout
    sections = resume_data.sections

    # Create document with geometry options
    geometry_options = {
        'top': f'{layout.margins.top}mm',
        'bottom': f'{layout.margins.bottom}mm',
        'left': f'{layout.margins.left}mm',
        'right': f'{layout.margins.right}mm'
    }
    
    doc = Document(
        documentclass='article',
        document_options=[f'letterpaper', f'{layout.fonts.contentSize}pt'],
        geometry_options=geometry_options,
        page_numbers=False
    )
    
    # Add packages
    doc.packages.append(Package('enumitem'))
    doc.packages.append(Package('titlesec'))
    doc.packages.append(Package('fontspec'))
    doc.packages.append(Package('xcolor'))
    doc.packages.append(Package('array'))
    
    # Add font configuration
    doc.append(NoEscape('\\setmainfont{Times New Roman}'))
    
    # Configure section formatting
    doc.append(NoEscape(f'''\\titleformat{{\\section}}{{\\fontsize{{{layout.fonts.sectionSize}pt}}{{{layout.fonts.sectionSize + 2}pt}}\\selectfont\\bfseries\\uppercase}}{{}}{{0pt}}{{}}[\\titlerule]'''))
    doc.append(NoEscape(f'''\\titlespacing*{{\\section}}{{0pt}}{{{layout.spacing.sectionSpacing}pt}}{{{layout.spacing.itemSpacing}pt}}'''))
    
    # Add custom commands
    doc.append(NoEscape('\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, label=$\\bullet$]}'))
    doc.append(NoEscape('\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}'))
    doc.append(NoEscape('\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}'))
    
    # Header with personal information
    with doc.create(Environment(name='center')):
        # Name
        doc.append(NoEscape(f'''{{\\fontsize{{{layout.fonts.nameSize}pt}}{{{layout.fonts.nameSize + 4}pt}}\\selectfont\\textbf{{{sections.personal.name}}}}}'''))
        doc.append(NewLine())
        doc.append(NoEscape('\\vspace{2pt}'))
        doc.append(NewLine())
        
        # Contact info
        contact_parts = []
        if sections.personal.phone:
            contact_parts.append(sections.personal.phone)
        if sections.personal.email:
            contact_parts.append(sections.personal.email)
        if sections.personal.location:
            contact_parts.append(sections.personal.location)
        if sections.personal.website:
            contact_parts.append(sections.personal.website)
        
        contact_line = ' $|$ '.join(contact_parts)
        doc.append(NoEscape(f'{{\\small {contact_line}}}'))
    
    doc.append(NewLine())
    doc.append(NewLine())
    
    # Experience section
    if sections.experience:
        with doc.create(Section('Experience', numbering=False)):
            for exp in sections.experience:
                # Job heading
                with doc.create(ResumeSubheading(
                    title=exp.title,
                    dates=f'{exp.startDate} -- {exp.endDate}',
                    company=exp.company,
                    location=exp.location
                )):
                    pass
                
                doc.append(NoEscape('\\vspace{-7pt}'))
                doc.append(NewLine())
                
                # Bullet points
                if exp.bullets:
                    doc.append(NoEscape('\\resumeItemListStart'))
                    for bullet in exp.bullets:
                        doc.append(NoEscape(f'\\resumeItem{{{bullet}}}'))
                    doc.append(NoEscape('\\resumeItemListEnd'))
                    doc.append(NewLine())
    
    # Education section
    if sections.education:
        with doc.create(Section('Education', numbering=False)):
            for edu in sections.education:
                with doc.create(ResumeEducation(
                    degree=edu.degree,
                    graduation_date=edu.graduationDate,
                    school=edu.school,
                    location=edu.location,
                    gpa=edu.gpa
                )):
                    pass
                
                doc.append(NoEscape('\\vspace{-7pt}'))
                doc.append(NewLine())
                doc.append(NewLine())
    
    # Skills section
    if sections.skills:
        with doc.create(Section('Technical Skills', numbering=False)):
            doc.append(NoEscape('\\begin{itemize}[leftmargin=0.15in, label={}]'))
            doc.append(NoEscape('\\small{\\item{'))
            
            for i, skill in enumerate(sections.skills):
                if ':' in skill:
                    category, items = map(str.strip, skill.split(':', 1))
                    doc.append(NoEscape(f'\\textbf{{{category}:}} {items}'))
                else:
                    doc.append(NoEscape(skill))
                
                if i < len(sections.skills) - 1:
                    doc.append(NoEscape(' \\\\'))
                doc.append(NewLine())
            
            doc.append(NoEscape('}}'))
            doc.append(NoEscape('\\end{itemize}'))
    
    return doc

def generate_latex(resume_data: ResumeData) -> str:
    """Generate LaTeX string from resume data (for backward compatibility)"""
    doc = generate_latex_document(resume_data)
    return doc.dumps()