from pydantic import BaseModel
from typing import Optional


class OnboardingBase(BaseModel):
    # A. Academic Background
    current_education_level: Optional[str] = None
    degree_major: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa_or_percentage: Optional[str] = None
    # B. Study Goal
    intended_degree: Optional[str] = None
    field_of_study: Optional[str] = None
    target_intake_year: Optional[int] = None
    preferred_countries: Optional[str] = None
    # C. Budget
    budget_range_per_year: Optional[str] = None
    funding_plan: Optional[str] = None
    # D. Exams & Readiness
    ielts_toefl_status: Optional[str] = None
    ielts_toefl_score: Optional[str] = None
    gre_gmat_status: Optional[str] = None
    gre_gmat_score: Optional[str] = None
    sop_status: Optional[str] = None


class OnboardingCreate(OnboardingBase):
    pass


class OnboardingUpdate(OnboardingBase):
    pass


class Onboarding(OnboardingBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
