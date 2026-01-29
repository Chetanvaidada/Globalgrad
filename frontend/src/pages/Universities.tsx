import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { University } from '../data/universities';
import { universities } from '../data/universities';
import {
    Lock,
    Unlock,
    MapPin,
    CheckCircle2,
    Calendar,
    FileText,
    ArrowLeft,
    Heart,
    Trash2,
    GraduationCap,
    BookOpen,
    Banknote
} from 'lucide-react';
import '../Universities.css';

const API_URL = import.meta.env.VITE_API_URL;



type Tab = 'all' | 'shortlisted' | 'locked';

const Universities: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('all');

    // Core Data State
    const [allUniversities, setAllUniversities] = useState<University[]>([]);
    const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
    const [lockedIds, setLockedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch User Preferences (Still fetch for other potential uses, but don't filter)
                await fetch(`${API_URL}/onboarding`, { credentials: 'include' });

                // 2. Fetch User Selections
                const selRes = await fetch(`${API_URL}/universities`, { credentials: 'include' });
                const selections: { university_id: string; status: string }[] = selRes.ok ? await selRes.json() : [];

                const sIds = selections.filter(s => s.status === 'shortlisted').map(s => s.university_id);
                const lIds = selections.filter(s => s.status === 'locked').map(s => s.university_id);
                setShortlistedIds(sIds);
                setLockedIds(lIds);

                // 3. Set All Universities (No Filtering)
                setAllUniversities(universities);

            } catch (e) {
                console.error(e);
                setAllUniversities(universities);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Actions
    const handleShortlist = async (id: string) => {
        if (shortlistedIds.includes(id)) {
            // Remove
            try {
                await fetch(`${API_URL}/universities/${id}`, { method: 'DELETE', credentials: 'include' });
                setShortlistedIds(prev => prev.filter(sid => sid !== id));
            } catch (e) {
                console.error("Failed to remove", e);
            }
        } else {
            // Add
            try {
                await fetch(`${API_URL}/universities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ university_id: id, status: 'shortlisted' })
                });
                setShortlistedIds(prev => [...prev, id]);
            } catch (e) {
                console.error("Failed to add", e);
            }
        }
    };

    const handleLock = async (id: string) => {
        try {
            await fetch(`${API_URL}/universities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ university_id: id, status: 'locked' })
            });
            setLockedIds(prev => [...prev, id]);
            setShortlistedIds(prev => prev.filter(sid => sid !== id));
            setActiveTab('locked');
        } catch (e) {
            console.error("Failed to lock", e);
        }
    };

    const handleUnlock = async (id: string) => {
        if (window.confirm("Unlock this university? You will simply move it back to your shortlist.")) {
            try {
                await fetch(`${API_URL}/universities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ university_id: id, status: 'shortlisted' })
                });
                setLockedIds(prev => prev.filter(lid => lid !== id));
                setShortlistedIds(prev => [...prev, id]);
            } catch (e) {
                console.error("Failed to unlock", e);
            }
        }
    };

    // Render Logic
    const getDisplayUniversities = () => {
        switch (activeTab) {
            case 'shortlisted':
                return allUniversities.filter(u => shortlistedIds.includes(u.id));
            case 'locked':
                return allUniversities.filter(u => lockedIds.includes(u.id));
            case 'all':
            default:
                return allUniversities;
        }
    };

    if (loading) return <div className="universities-container">Loading...</div>;

    const displayUnis = getDisplayUniversities();

    return (
        <div className="universities-container">
            <div className="grid-bg"></div>

            <header className="universities-header-area">
                <button className="btn-nav btn-back" onClick={() => navigate('/dashboard')} style={{ position: 'absolute', left: '2rem', top: '2rem' }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <h1 className="uni-title">Global Universities</h1>
                <p className="uni-subtitle">Explore, Shortlist, and Apply</p>
            </header>

            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <BookOpen size={16} /> All Universities
                </button>
                <button
                    className={`tab-btn ${activeTab === 'shortlisted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shortlisted')}
                >
                    <Heart size={16} /> Shortlisted ({shortlistedIds.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'locked' ? 'active' : ''}`}
                    onClick={() => setActiveTab('locked')}
                >
                    <Lock size={16} /> Locked ({lockedIds.length})
                </button>
            </div>

            {displayUnis.length === 0 ? (
                <div className="empty-state">
                    {activeTab === 'shortlisted' ? "You haven't shortlisted any universities yet." :
                        activeTab === 'locked' ? "No universities locked for application yet." : "No universities found."}
                </div>
            ) : (
                <>
                    {activeTab === 'locked' ? (
                        <div className="locked-container">
                            {displayUnis.map(uni => (
                                <div key={uni.id} className="guidance-expander">
                                    <div className="locked-header">
                                        <div>
                                            <h3 className="locked-title">{uni.name}</h3>
                                            <div style={{ color: 'var(--text-muted)' }}>{uni.country} • {uni.major}</div>
                                        </div>
                                        <button className="btn-action btn-unlock" onClick={() => handleUnlock(uni.id)} style={{ width: 'auto' }}>
                                            <Unlock size={16} /> Unlock
                                        </button>
                                    </div>
                                    <div className="guidance-grid-compact">
                                        <div className="guidance-box">
                                            <h4><FileText size={16} className="text-primary" /> Checklist</h4>
                                            <div className="checklist-item"><CheckCircle2 size={14} /> Transcripts</div>
                                            <div className="checklist-item"><CheckCircle2 size={14} /> SOP ({uni.country} Format)</div>
                                            <div className="checklist-item"><CheckCircle2 size={14} /> LORs (2 Academic)</div>
                                        </div>
                                        <div className="guidance-box">
                                            <h4><Calendar size={16} className="text-primary" /> Key Dates</h4>
                                            <div className="checklist-item"><strong>App Deadline:</strong> Dec 15</div>
                                            <div className="checklist-item"><strong>Decision:</strong> Mar 15</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="uni-grid">
                            {displayUnis.map(uni => {
                                const isShortlisted = shortlistedIds.includes(uni.id);
                                const isLocked = lockedIds.includes(uni.id);

                                return (
                                    <div key={uni.id} className="uni-card">
                                        <div className="uni-card-header" style={{ backgroundImage: `url(${uni.bgPhoto})` }}>
                                            <div className="uni-overlay"></div>
                                        </div>
                                        <div className="uni-content">
                                            <h3 className="uni-name">{uni.name}</h3>
                                            <div className="uni-location">
                                                <MapPin size={12} /> {uni.country}
                                            </div>
                                            <p className="uni-description">{uni.description}</p>

                                            <div className="uni-metrics-row">
                                                <div className="uni-metric"><Banknote size={14} /> {uni.fee}</div>
                                                <div className="uni-metric"><GraduationCap size={12} /> {uni.acceptanceRate} rate</div>
                                            </div>

                                            {activeTab === 'shortlisted' ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-action btn-shortlist" onClick={() => handleShortlist(uni.id)} style={{ flex: 1 }}>
                                                        <Trash2 size={16} /> Remove
                                                    </button>
                                                    <button className="btn-action btn-lock" onClick={() => handleLock(uni.id)} style={{ flex: 2 }}>
                                                        <Lock size={16} /> Lock Application
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className={`btn-action btn-shortlist ${isShortlisted ? 'active' : ''}`}
                                                    onClick={() => handleShortlist(uni.id)}
                                                    disabled={isLocked}
                                                >
                                                    {isLocked ? (
                                                        <> <Lock size={16} /> Locked </>
                                                    ) : (
                                                        <>
                                                            <Heart size={16} fill={isShortlisted ? "currentColor" : "none"} />
                                                            {isShortlisted ? "Shortlisted" : "Shortlist"}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Universities;
