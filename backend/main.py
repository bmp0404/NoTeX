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
    try:
        layout = resume_data.layout
        sections = resume_data.sections
        
        # Debug logging
        print(f"Layout data: {layout}")
        print(f"Fonts data: {layout.fonts}")
        print(f"Margins data: {layout.margins}")
        print(f"Spacing data: {layout.spacing}")
        
        # Safely get font sizes with defaults
        content_size = getattr(layout.fonts, 'contentSize', 11)
        section_size = getattr(layout.fonts, 'sectionSize', 14)
        name_size = getattr(layout.fonts, 'nameSize', 24)
        
        # Safely get margin values with defaults
        top_margin = getattr(layout.margins, 'top', 20)
        bottom_margin = getattr(layout.margins, 'bottom', 20)
        left_margin = getattr(layout.margins, 'left', 15)
        right_margin = getattr(layout.margins, 'right', 15)
        
        # Safely get spacing values with defaults
        section_spacing = getattr(layout.spacing, 'sectionSpacing', 12)
        item_spacing = getattr(layout.spacing, 'itemSpacing', 6)

        latex_content = f"""\\documentclass[letterpaper,{content_size}pt]{{article}}
\\usepackage[top={top_margin}mm,bottom={bottom_margin}mm,left={left_margin}mm,right={right_margin}mm]{{geometry}}
\\usepackage{{enumitem}}
\\usepackage{{titlesec}}
\\usepackage{{fontspec}}
\\usepackage{{xcolor}}

\\pagestyle{{empty}}
\\setmainfont{{Times New Roman}}

\\titleformat{{\\section}}{{\\fontsize{{{section_size}pt}}{{{section_size + 2}pt}}\\selectfont\\bfseries\\uppercase}}{{}}{{0pt}}{{}}[\\titlerule]
\\titlespacing*{{\\section}}{{0pt}}{{{section_spacing}pt}}{{{item_spacing}pt}}

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
    {{\\fontsize{{{name_size}pt}}{{{name_size + 4}pt}}\\selectfont\\textbf{{{sections.personal.name}}}}} \\\\
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
        
    except Exception as e:
        print(f"Error in generate_latex: {e}")
        print(f"Resume data structure: {resume_data}")
        raise Exception(f"Failed to generate LaTeX: {str(e)}")


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

@app.post("/debug-data")
async def debug_data(request: CompileRequest):
    """Debug endpoint to inspect the data structure being sent"""
    try:
        return {
            "message": "Data received successfully",
            "resumeTitle": request.resumeTitle,
            "dataStructure": {
                "hasLayout": hasattr(request.resumeData, 'layout'),
                "hasSections": hasattr(request.resumeData, 'sections'),
                "layoutKeys": list(request.resumeData.layout.__dict__.keys()) if hasattr(request.resumeData, 'layout') else None,
                "sectionsKeys": list(request.resumeData.sections.__dict__.keys()) if hasattr(request.resumeData, 'sections') else None,
                "fontsKeys": list(request.resumeData.layout.fonts.__dict__.keys()) if hasattr(request.resumeData, 'layout') and hasattr(request.resumeData.layout, 'fonts') else None,
                "marginsKeys": list(request.resumeData.layout.margins.__dict__.keys()) if hasattr(request.resumeData, 'layout') and hasattr(request.resumeData.layout, 'margins') else None,
                "spacingKeys": list(request.resumeData.layout.spacing.__dict__.keys()) if hasattr(request.resumeData, 'layout') and hasattr(request.resumeData.layout, 'spacing') else None,
            },
            "rawData": {
                "layout": request.resumeData.layout.__dict__ if hasattr(request.resumeData, 'layout') else None,
                "sections": request.resumeData.sections.__dict__ if hasattr(request.resumeData, 'sections') else None,
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "errorType": type(e).__name__,
            "rawRequest": str(request)
        }

@app.post("/compile-pdf")
async def compile_pdf(request: CompileRequest):
    """Compile resume data to PDF"""
    
    try:
        # Debug logging
        print(f"Received compile request for resume: {request.resumeTitle}")
        print(f"Resume data structure: {request.resumeData}")
        print(f"Layout: {request.resumeData.layout}")
        print(f"Sections: {request.resumeData.sections}")
        
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
                
                # Debug: Save LaTeX content to file for inspection
                tex_debug_file = os.path.join(temp_dir, "debug.tex")
                with open(tex_debug_file, 'w', encoding='utf-8') as f:
                    f.write(latex_content)
                print(f"Generated LaTeX content saved to: {tex_debug_file}")
                
                # Compile to PDF
                pdf_path = compile_latex_to_pdf(latex_content, temp_dir)
                
                # Read PDF file
                with open(pdf_path, 'rb') as pdf_file:
                    pdf_content = pdf_file.read()
                
                print(f"PDF generated successfully, size: {len(pdf_content)} bytes")
                
                # Return PDF as response
                return Response(
                    content=pdf_content,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f"attachment; filename=\"{request.resumeTitle}.pdf\""
                    }
                )
                
            except Exception as e:
                print(f"Error during PDF compilation: {e}")
                raise HTTPException(status_code=500, detail=f"Error compiling PDF: {str(e)}")
                
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in compile_pdf: {e}")
        print(f"Request data: {request}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

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