import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Target,
    CheckCircle,
    ListTodo,
    Activity,
    School,
    LogOut,
    Edit2,
    GraduationCap,
    Globe,
    Wallet
} from 'lucide-react';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL;

interface OnboardingData {
    current_education_level?: string;
    degree_major?: string;
    graduation_year?: number;
    gpa_or_percentage?: string;
    intended_degree?: string;
    field_of_study?: string;
    target_intake_year?: number;
    preferred_countries?: string;
    budget_range_per_year?: string;
    funding_plan?: string;
    ielts_toefl_status?: string;
    ielts_toefl_score?: string;
    gre_gmat_status?: string;
    gre_gmat_score?: string;
    sop_status?: string;
}

interface ToDoItem {
    id: number;
    text: string;
    completed: boolean;
}

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<OnboardingData | null>(null);
    const [selections, setSelections] = useState<{ university_id: string; status: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [todos, setTodos] = useState<ToDoItem[]>([
        { id: 1, text: "Research top universities for your major", completed: false },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Onboarding Data
                const onbRes = await fetch(`${API_URL}/onboarding`, { credentials: 'include' });
                const onbData = onbRes.ok ? await onbRes.json() : null;
                setData(onbData);

                // Fetch Selections
                const selRes = await fetch(`${API_URL}/universities`, { credentials: 'include' });
                const selData = selRes.ok ? await selRes.json() : [];
                setSelections(selData);

                if (onbData) generateTodos(onbData, selData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const generateTodos = (d: OnboardingData, sels: { status: string, university_id: string }[] = []) => {
        const newTodos: ToDoItem[] = [];
        const shortlistedCount = sels.filter(s => s.status === 'shortlisted').length;
        const lockedCount = sels.filter(s => s.status === 'locked').length;

        // 1. Exam tasks
        if (d.ielts_toefl_status === 'not_taken') {
            newTodos.push({ id: 2, text: "Register for IELTS/TOEFL", completed: false });
        }
        if (d.gre_gmat_status === 'not_taken' && d.intended_degree !== "Bachelor's") {
            newTodos.push({ id: 3, text: "Check GRE/GMAT requirements", completed: false });
        }

        // 2. SOP tasks
        if (d.sop_status === 'Not started') {
            newTodos.push({ id: 4, text: "Draft your Statement of Purpose", completed: false });
        } else if (d.sop_status === 'Draft') {
            newTodos.push({ id: 4, text: "Finalize SOP", completed: false });
        }

        // 3. Selection Tasks
        if (lockedCount > 0) {
            newTodos.push({ id: 5, text: "Start application for your locked university", completed: false });
        } else if (shortlistedCount >= 3) {
            newTodos.push({ id: 6, text: "Lock your target university to start applying", completed: false });
        } else {
            newTodos.push({ id: 7, text: "Shortlist at least 3 universities", completed: false });
        }

        setTodos(prev => [...prev.filter(t => t.id === 1), ...newTodos]);
    };

    const toggleTodo = (id: number) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getProfileStrength = () => {
        if (!data) return { label: 'Weak', class: 'strength-weak' };
        let score = 0;
        if (data.gpa_or_percentage) score++;
        if (data.ielts_toefl_status === 'taken') score++;
        if (data.gre_gmat_status === 'taken') score++;
        if (data.sop_status === 'Ready') score++; // Bonus

        if (score >= 3) return { label: 'Strong', class: 'strength-strong' };
        if (score >= 1) return { label: 'Average', class: 'strength-average' };
        return { label: 'Needs Work', class: 'strength-weak' };
    };

    const determineStage = () => {
        const shortlisted = selections.filter(s => s.status === 'shortlisted').length;
        const locked = selections.filter(s => s.status === 'locked').length;

        if (locked > 0) return 4; // Finalizing / Applications
        if (shortlisted > 0) return 3; // Shortlisting
        return 2; // University Discovery (Default)
    };

    const strength = getProfileStrength();
    const currentStage = determineStage();
    const userName = user?.full_name?.split(' ')[0] || "User";

    const STAGES = ['Profile Setup', 'University Discovery', 'Shortlisting', 'Applications'];

    if (loading) return <div className="dashboard-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="grid-bg"></div>

            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="dashboard-title">Hello, {userName}</h1>
                    <p className="dashboard-subtitle">Your Study Abroad Control Center</p>
                </div>
                <div className="header-right">
                    <button className="btn-header" onClick={() => navigate('/universities')}>
                        <GraduationCap size={16} /> Universities
                    </button>
                    <button className="btn-header" onClick={() => navigate('/onboarding')}>
                        <Edit2 size={16} /> Update Preferences
                    </button>
                    <button className="btn-header logout" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">

                {/* C. Current Stage Indicator */}
                <div className="dashboard-card section-stage">
                    <div className="card-header">
                        <h3 className="card-title"><Target size={20} className="text-primary" /> Current Stage</h3>
                    </div>

                    <div className="stage-tracker">
                        {STAGES.map((label, idx) => {
                            const stageNum = idx + 1;
                            let statusClass = '';
                            if (stageNum < currentStage) statusClass = 'completed';
                            if (stageNum === currentStage) statusClass = 'active';

                            return (
                                <div key={idx} className={`stage-step ${statusClass}`}>
                                    <div className="stage-number">
                                        {statusClass === 'completed' ? <CheckCircle size={18} /> : stageNum}
                                    </div>
                                    <span className="stage-label">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* A. Profile Summary */}
                <div className="dashboard-card section-profile">
                    <div className="card-header">
                        <h3 className="card-title"><School size={20} className="text-primary" /> Profile Summary</h3>
                    </div>

                    <div className="profile-stat">
                        <div className="stat-label">Intended Degree</div>
                        <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GraduationCap size={16} color="var(--primary)" />
                            {data?.intended_degree || "Not set"}
                            {data?.field_of_study && <span style={{ fontSize: '0.85em', opacity: 0.7 }}>in {data.field_of_study}</span>}
                        </div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-label">Target Intake</div>
                        <div className="stat-value">{data?.target_intake_year || "Unknown"}</div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-label">Current Education</div>
                        {/* Fallback to show something if major is missing */}
                        <div className="stat-value">{data?.degree_major || data?.current_education_level || "Not set"}</div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-label">Preferred Countries</div>
                        <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={16} color="var(--primary)" />
                            {data?.preferred_countries || "Any"}
                        </div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-label">Budget</div>
                        <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wallet size={16} color="var(--primary)" />
                            {data?.budget_range_per_year || "Undecided"}
                        </div>
                    </div>
                </div>

                {/* B. Profile Strength */}
                <div className="dashboard-card section-strength">
                    <div className="card-header">
                        <h3 className="card-title"><Activity size={20} className="text-primary" /> Profile Strength</h3>
                        <span className={`strength-badge ${strength.class}`}>{strength.label}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Based on your academic history and test scores, your profile looks
                        {strength.label === 'Strong' ? " fantastic! You're ready to start applying to universities." :
                            strength.label === 'Average' ? " good, but a few more improvements on exams or SOP will help." :
                                " like it's in the early stages. Focus on exams and your SOP."}
                    </p>

                    <div className="metrics-row">
                        <div className="metric-item">
                            <div className="stat-value">{data?.gpa_or_percentage || "-"}</div>
                            <div className="metric-label">GPA/Pct</div>
                        </div>
                        <div className="metric-item">
                            <div className="stat-value">{data?.ielts_toefl_score || "-"}</div>
                            <div className="metric-label">IELTS/TOEFL</div>
                        </div>
                        <div className="metric-item">
                            <div className="stat-value">{data?.gre_gmat_score || "-"}</div>
                            <div className="metric-label">GRE/GMAT</div>
                        </div>
                        <div className="metric-item">
                            <div className="stat-value">{data?.sop_status || "-"}</div>
                            <div className="metric-label">SOP Status</div>
                        </div>
                    </div>
                </div>

                {/* D. AI To-Do List */}
                <div className="dashboard-card section-todo">
                    <div className="card-header">
                        <h3 className="card-title"><ListTodo size={20} className="text-primary" /> Recommended Tasks</h3>
                    </div>

                    <div className="todo-list">
                        {todos.length === 0 ? (
                            <div className="empty-state">All caught up!</div>
                        ) : (
                            todos.map(todo => (
                                <div
                                    key={todo.id}
                                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                                    onClick={() => toggleTodo(todo.id)}
                                >
                                    <div className="todo-checkbox">
                                        {todo.completed && <CheckCircle size={14} color="#fff" />}
                                    </div>
                                    <span className="todo-text">{todo.text}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
