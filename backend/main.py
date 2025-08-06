from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import tempfile
import subprocess
import os
import json
from pathlib import Path
import shutil

app = FastAPI(title="NoTeX", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    website: str

class Experience(BaseModel):
    title: str
    company: str
    location: str
    startDate: str
    endDate: str
    bullets: List[str]

class Education(BaseModel):
    degree: str
    school: str
    location: str
    graduationDate: str
    gpa: Optional[str] = ""

class Layout(BaseModel):
    margins: Dict[str, int]
    spacing: Dict[str, int]
    fonts: Dict[str, int]

class Sections(BaseModel):
    personal: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    skills: List[str]

class ResumeData(BaseModel):
    layout: Layout
    sections: Sections

class CompileRequest(BaseModel):
    resumeData: ResumeData
    resumeTitle: str

def check_tectonic():
    """Check if Tectonic is installed and available"""
    try:
        result = subprocess.run(['tectonic', '--version'], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def generate_latex(resume_data: ResumeData) -> str:
    """Generate LaTeX code from resume data"""
    layout = resume_data.layout
    sections = resume_data.sections

    latex_content = f"""\\documentclass[letterpaper,{layout.fonts.contentSize}pt]{{article}}
\\usepackage[top={layout.margins.top}mm,bottom={layout.margins.bottom}mm,left={layout.margins.left}mm,right={layout.margins.right}mm]{{geometry}}
\\usepackage{{enumitem}}
\\usepackage{{titlesec}}
\\usepackage{{fontspec}}
\\usepackage{{xcolor}}

\\pagestyle{{empty}}
\\setmainfont{{Times New Roman}}

\\titleformat{{\\section}}{{\\fontsize{{{layout.fonts.sectionSize}pt}}{{{layout.fonts.sectionSize + 2}pt}}\\selectfont\\bfseries\\uppercase}}{{}}{{0pt}}{{}}[\\titlerule]
\\titlespacing*{{\\section}}{{0pt}}{{{layout.spacing.sectionSpacing}pt}}{{{layout.spacing.itemSpacing}pt}}

\\newcommand{{\\resumeSubheading}}[4]{{
\\begin{{tabular*}}{{\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}
    \\textbf{{#1}} & #2 \\\\
    \\textit{{\\small#3}} & \\textit{{\\small #4}} \\\\
\\end{{tabular*}}\\vspace{{-7pt}}
}}

\\newcommand{{\\resumeEducation}}[5]{{
\\begin{{tabular*}}{{\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}
    \\textbf{{#1}} & #2 \\\\
    \\textit{{\\small#3}} & \\textit{{\\small #4}} \\\\
\\end{{tabular*}}
\\ifx\\relax#5\\relax
\\else
    \\vspace{{-5pt}}
    \\begin{{tabular*}}{{\\textwidth}}[t]{{l}}
        \\small GPA: #5 \\\\
    \\end{{tabular*}}
\\fi
\\vspace{{-7pt}}
}}

\\newcommand{{\\resumeItemListStart}}{{\\begin{{itemize}}[leftmargin=0.15in, label=$\\bullet$]}}
\\newcommand{{\\resumeItemListEnd}}{{\\end{{itemize}}\\vspace{{-5pt}}}}
\\newcommand{{\\resumeItem}}[1]{{\\item\\small{{#1 \\vspace{{-2pt}}}}}}

\\begin{{document}}

\\begin{{center}}
    {{\\fontsize{{{layout.fonts.nameSize}pt}}{{{layout.fonts.nameSize + 4}pt}}\\selectfont\\textbf{{{sections.personal.name}}}}} \\\\
    \\vspace{{2pt}}
    {{\\small {sections.personal.phone} $|$ {sections.personal.email} $|$ {sections.personal.location}"""
    
    if sections.personal.website:
        latex_content += f" $|$ {sections.personal.website}"
    
    latex_content += "}\n\\end{center}\n\n"

    if sections.experience:
        latex_content += "\\section{Experience}\n"
        for exp in sections.experience:
            latex_content += f"""\\resumeSubheading
    {{{exp.title}}}{{{exp.startDate} -- {exp.endDate}}}
    {{{exp.company}}}{{{exp.location}}}
    \\resumeItemListStart
"""
            for bullet in exp.bullets:
                escaped_bullet = (
                    bullet.replace('&', '\\&')
                          .replace('%', '\\%')
                          .replace('$', '\\$')
                          .replace('#', '\\#')
                          .replace('_', '\\_')
                          .replace('{', '\\{')
                          .replace('}', '\\}')
                )
                latex_content += f"        \\resumeItem{{{escaped_bullet}}}\n"
            latex_content += "    \\resumeItemListEnd\n\n"

    if sections.education:
        latex_content += "\\section{Education}\n"
        for edu in sections.education:
            gpa_param = edu.gpa if edu.gpa else ""
            latex_content += f"""\\resumeEducation
    {{{edu.degree}}}{{{edu.graduationDate}}}
    {{{edu.school}}}{{{edu.location}}}
    {{{gpa_param}}}

"""

    if sections.skills:
        latex_content += "\\section{Technical Skills}\n"
        latex_content += "\\begin{itemize}[leftmargin=0.15in, label={}]\n"
        latex_content += "    \\small{\\item{\n"
        for i, skill in enumerate(sections.skills):
            if ':' in skill:
                category, items = map(str.strip, skill.split(':', 1))
                latex_content += f"        \\textbf{{{category}:}} {items}"
            else:
                latex_content += f"        {skill}"
            if i < len(sections.skills) - 1:
                latex_content += " \\\\\n"
            else:
                latex_content += "\n"
        latex_content += "    }}\n\\end{itemize}\n\n"

    latex_content += "\\end{document}"
    return latex_content


def compile_latex_to_pdf(latex_content: str, output_dir: str) -> str:
    """Compile LaTeX content to PDF using Tectonic"""
    tex_file = os.path.join(output_dir, "resume.tex")
    pdf_file = os.path.join(output_dir, "resume.pdf")
    
    # Write LaTeX content to file
    with open(tex_file, 'w', encoding='utf-8') as f:
        f.write(latex_content)
    
    try:
        # Compile with Tectonic
        result = subprocess.run([
            'tectonic', 
            '--outdir', output_dir,
            tex_file
        ], capture_output=True, text=True, cwd=output_dir)
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500, 
                detail=f"LaTeX compilation failed: {result.stderr}"
            )
        
        if not os.path.exists(pdf_file):
            raise HTTPException(
                status_code=500,
                detail="PDF file was not generated"
            )
            
        return pdf_file
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Tectonic not found. Please install Tectonic LaTeX engine."
        )

@app.get("/")
async def root():
    return {"message": "LaTeX Resume Compiler API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    tectonic_available = check_tectonic()
    return {
        "status": "healthy",
        "tectonic_available": tectonic_available
    }

@app.post("/compile-pdf")
async def compile_pdf(request: CompileRequest):
    """Compile resume data to PDF"""
    
    # Check if Tectonic is available
    if not check_tectonic():
        raise HTTPException(
            status_code=500,
            detail="Tectonic LaTeX engine is not installed or not available in PATH"
        )
    
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # Generate LaTeX content
            latex_content = generate_latex(request.resumeData)
            
            # Compile to PDF
            pdf_path = compile_latex_to_pdf(latex_content, temp_dir)
            
            # Read PDF file
            with open(pdf_path, 'rb') as pdf_file:
                pdf_content = pdf_file.read()
            
            # Return PDF as response
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=\"{request.resumeTitle}.pdf\""
                }
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error compiling PDF: {str(e)}")

@app.post("/preview-latex")
async def preview_latex(request: CompileRequest):
    """Generate LaTeX code for preview (debugging purposes)"""
    try:
        latex_content = generate_latex(request.resumeData)
        return {"latex": latex_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating LaTeX: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)