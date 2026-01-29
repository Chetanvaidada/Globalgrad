import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FileText, Mic, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './Onboarding.css';

const API_URL = import.meta.env.VITE_API_URL;

interface OnboardingData {
    current_education_level?: string | null;
    degree_major?: string | null;
    graduation_year?: number | null;
    gpa_or_percentage?: string | null;
    intended_degree?: string | null;
    field_of_study?: string | null;
    target_intake_year?: number | null;
    preferred_countries?: string | null;
    budget_range_per_year?: string | null;
    funding_plan?: string | null;
    ielts_toefl_status?: string | null;
    ielts_toefl_score?: string | null;
    gre_gmat_status?: string | null;
    gre_gmat_score?: string | null;
    sop_status?: string | null;
}

const defaultForm: OnboardingData = {
    current_education_level: '',
    degree_major: '',
    graduation_year: undefined,
    gpa_or_percentage: '',
    intended_degree: '',
    field_of_study: '',
    target_intake_year: undefined,
    preferred_countries: '',
    budget_range_per_year: '',
    funding_plan: '',
    ielts_toefl_status: 'not_taken',
    ielts_toefl_score: '',
    gre_gmat_status: 'not_taken',
    gre_gmat_score: '',
    sop_status: 'Not started',
};

type OnboardingMode = 'choice' | 'manual' | 'voice';
type Step = 1 | 2 | 3 | 4;

const Onboarding: React.FC = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<OnboardingMode>('choice');
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [form, setForm] = useState<OnboardingData>(defaultForm);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/onboarding`, { credentials: 'include' })
            .then((r) => (r.ok ? r.json() : null))
            .then((data: OnboardingData | null) => {
                if (data) {
                    setForm({
                        ...defaultForm,
                        ...data,
                        graduation_year: data.graduation_year ?? undefined,
                        target_intake_year: data.target_intake_year ?? undefined,
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const update = (key: keyof OnboardingData, value: string | number | undefined | null) => {
        setForm((prev) => ({ ...prev, [key]: value ?? '' }));
    };

    const saveProgress = async () => {
        try {
            await fetch(`${API_URL}/onboarding`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    graduation_year: form.graduation_year || null,
                    target_intake_year: form.target_intake_year || null,
                    ielts_toefl_score: form.ielts_toefl_status === 'taken' ? form.ielts_toefl_score : null,
                    gre_gmat_score: form.gre_gmat_status === 'taken' ? form.gre_gmat_score : null,
                }),
            });
        } catch (error) {
            console.error('Failed to save progress', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/onboarding`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    graduation_year: form.graduation_year || null,
                    target_intake_year: form.target_intake_year || null,
                    ielts_toefl_score: form.ielts_toefl_status === 'taken' ? form.ielts_toefl_score : null,
                    gre_gmat_score: form.gre_gmat_status === 'taken' ? form.gre_gmat_score : null,
                }),
            });
            if (res.ok) {
                await checkAuth();
                navigate('/dashboard');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = async () => {
        if (currentStep < 4) {
            await saveProgress();
            setCurrentStep((prev) => (prev + 1) as Step);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
        }
    };

    const userName = user?.full_name || 'User';
    const steps = ['Academic Background', 'Study Goal', 'Budget', 'Exams & Readiness'];

    if (loading) {
        return (
            <div className="onboarding-container">
                <div className="grid-bg" />
                <div className="onboarding-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="onboarding-subtitle">Loading...</p>
                </div>
            </div>
        );
    }

    // Choice screen
    if (mode === 'choice') {
        return (
            <div className="onboarding-container">
                <div className="grid-bg" />
                <div className="onboarding-card glass">
                    <div className="onboarding-header">
                        <h1 className="onboarding-title">Welcome, {userName}</h1>
                        <p className="onboarding-subtitle">Choose how you&apos;d like to complete your profile</p>
                    </div>
                    <div className="options-grid">
                        <div className="option-card" onClick={() => setMode('manual')}>
                            <FileText className="option-icon" />
                            <div className="option-label">Manual Form</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Fill out the form step by step
                            </p>
                        </div>
                        <div className="option-card" onClick={() => setMode('voice')}>
                            <Mic className="option-icon" />
                            <div className="option-label">Voice-Based</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                AI Counsellor will guide you
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Voice-based (placeholder for now)
    if (mode === 'voice') {
        return (
            <div className="onboarding-container">
                <div className="grid-bg" />
                <div className="onboarding-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Mic size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                    <h1 className="onboarding-title">Voice-Based Onboarding</h1>
                    <p className="onboarding-subtitle" style={{ marginBottom: '2rem' }}>
                        Coming soon! The AI Counsellor will ask you questions conversationally.
                    </p>
                    <button className="btn-nav btn-next" onClick={() => setMode('choice')} style={{ margin: '0 auto' }}>
                        <ArrowLeft size={18} /> Back to options
                    </button>
                </div>
            </div>
        );
    }
    

    // Manual form - multi-step
    return (
        <div className="onboarding-container">
            <div className="grid-bg" />
            <div className="onboarding-card glass">
                <div className="onboarding-header">
                    <h1 className="onboarding-title">Complete Your Profile</h1>
                    <p className="onboarding-subtitle">Step {currentStep} of {steps.length}: {steps[currentStep - 1]}</p>
                    <div className="step-indicator">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`step-dot ${idx + 1 <= currentStep ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <form className="onboarding-form" onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                    <div className="form-step">
                        {/* Step 1: Academic Background */}
                        {currentStep === 1 && (
                            <section className="onboarding-section">
                                <h2 className="section-title">Academic Background</h2>
                                <div className="form-group">
                                    <label className="form-label">Current education level</label>
                                    <select
                                        className="form-select"
                                        value={form.current_education_level || ''}
                                        onChange={(e) => update('current_education_level', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="High School">High School</option>
                                        <option value="Bachelor's">Bachelor&apos;s</option>
                                        <option value="Master's">Master&apos;s</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Degree / Major</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Computer Science"
                                        value={form.degree_major || ''}
                                        onChange={(e) => update('degree_major', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Graduation year</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 2024"
                                        min={1990}
                                        max={2040}
                                        value={form.graduation_year ?? ''}
                                        onChange={(e) => update('graduation_year', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GPA or % (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 3.5 or 85%"
                                        value={form.gpa_or_percentage || ''}
                                        onChange={(e) => update('gpa_or_percentage', e.target.value)}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Step 2: Study Goal */}
                        {currentStep === 2 && (
                            <section className="onboarding-section">
                                <h2 className="section-title">Study Goal</h2>
                                <div className="form-group">
                                    <label className="form-label">Intended degree</label>
                                    <select
                                        className="form-select"
                                        value={form.intended_degree || ''}
                                        onChange={(e) => update('intended_degree', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="Bachelor's">Bachelor&apos;s</option>
                                        <option value="Master's">Master&apos;s</option>
                                        <option value="MBA">MBA</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Field of study</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Data Science"
                                        value={form.field_of_study || ''}
                                        onChange={(e) => update('field_of_study', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target intake year</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 2026"
                                        min={2024}
                                        max={2035}
                                        value={form.target_intake_year ?? ''}
                                        onChange={(e) => update('target_intake_year', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Preferred countries</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. USA, UK, Canada"
                                        value={form.preferred_countries || ''}
                                        onChange={(e) => update('preferred_countries', e.target.value)}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        You can add multiple countries separated by commas
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Step 3: Budget */}
                        {currentStep === 3 && (
                            <section className="onboarding-section">
                                <h2 className="section-title">Budget</h2>
                                <div className="form-group">
                                    <label className="form-label">Budget range per year</label>
                                    <select
                                        className="form-select"
                                        value={form.budget_range_per_year || ''}
                                        onChange={(e) => update('budget_range_per_year', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="Under $10,000">Under $10,000</option>
                                        <option value="$10,000 - $30,000">$10,000 - $30,000</option>
                                        <option value="$30,000 - $60,000">$30,000 - $60,000</option>
                                        <option value="$60,000+">$60,000+</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Funding plan</label>
                                    <select
                                        className="form-select"
                                        value={form.funding_plan || ''}
                                        onChange={(e) => update('funding_plan', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="Self-funded">Self-funded</option>
                                        <option value="Scholarship-dependent">Scholarship-dependent</option>
                                        <option value="Loan-dependent">Loan-dependent</option>
                                    </select>
                                </div>
                            </section>
                        )}

                        {/* Step 4: Exams & Readiness */}
                        {currentStep === 4 && (
                            <section className="onboarding-section">
                                <h2 className="section-title">Exams & Readiness</h2>
                                <div className="form-group">
                                    <label className="form-label">IELTS / TOEFL</label>
                                    <select
                                        className="form-select"
                                        value={form.ielts_toefl_status || 'not_taken'}
                                        onChange={(e) => update('ielts_toefl_status', e.target.value)}
                                    >
                                        <option value="not_taken">Not taken</option>
                                        <option value="taken">Taken</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                    {form.ielts_toefl_status === 'taken' && (
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Score (e.g. 7.5 or 100)"
                                            value={form.ielts_toefl_score || ''}
                                            onChange={(e) => update('ielts_toefl_score', e.target.value)}
                                            style={{ marginTop: '0.75rem' }}
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GRE / GMAT</label>
                                    <select
                                        className="form-select"
                                        value={form.gre_gmat_status || 'not_taken'}
                                        onChange={(e) => update('gre_gmat_status', e.target.value)}
                                    >
                                        <option value="not_taken">Not taken</option>
                                        <option value="taken">Taken</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                    {form.gre_gmat_status === 'taken' && (
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Score (e.g. 320 or 700)"
                                            value={form.gre_gmat_score || ''}
                                            onChange={(e) => update('gre_gmat_score', e.target.value)}
                                            style={{ marginTop: '0.75rem' }}
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SOP status</label>
                                    <select
                                        className="form-select"
                                        value={form.sop_status || 'Not started'}
                                        onChange={(e) => update('sop_status', e.target.value)}
                                    >
                                        <option value="Not started">Not started</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Ready">Ready</option>
                                    </select>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="onboarding-footer">
                        {currentStep > 1 && (
                            <button type="button" className="btn-nav btn-back" onClick={prevStep}>
                                <ArrowLeft size={18} /> Back
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`btn-nav btn-next ${currentStep === 1 ? 'full-width' : ''}`}
                            disabled={submitting}
                            style={{ marginLeft: currentStep === 1 ? 'auto' : 'auto' }}
                        >
                            {currentStep === 4 ? (
                                <>
                                    {submitting ? 'Saving...' : 'Complete'}
                                    {!submitting && <Check size={18} />}
                                </>
                            ) : (
                                <>
                                    Next <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
