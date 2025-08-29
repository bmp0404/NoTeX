from pydantic import BaseModel
from typing import Dict, Any, List, Optional

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