from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os

from models import CompileRequest
from latex_generator import generate_latex
from pdf_compiler import check_tectonic, compile_latex_to_pdf

app = FastAPI(title="NoTeX", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    
    # Check if LaTeX engine is available
    if not check_tectonic():
        raise HTTPException(
            status_code=500,
            detail="LaTeX engine (pdflatex/xelatex) is not installed or not available in PATH"
        )
    
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # Compile to PDF using PyLaTeX
            pdf_path = compile_latex_to_pdf(request.resumeData, temp_dir, "resume")
            
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