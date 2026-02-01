import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './context/AuthContext';
import './Auth.css';
import uniBg from './assets/uni_bg.jpg';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [notice, setNotice] = useState<string | null>(null);
    const [isWakingUp, setIsWakingUp] = useState(false);

    const pendingNoticeTimerRef = useRef<number | null>(null);

    const clearPendingNoticeTimer = () => {
        if (pendingNoticeTimerRef.current !== null) {
            window.clearTimeout(pendingNoticeTimerRef.current);
            pendingNoticeTimerRef.current = null;
        }
    };

    const startPendingNoticeTimer = () => {
        clearPendingNoticeTimer();
        pendingNoticeTimerRef.current = window.setTimeout(() => {
            showBackendWakingNotice();
        }, 8000);
    };

    useEffect(() => {
        return () => {
            clearPendingNoticeTimer();
        };
    }, []);

    const showBackendWakingNotice = () => {
        setNotice('Server is waking up (Render sleeps after inactivity). Please wait 1–2 minutes and try again.');
        setIsWakingUp(true);
        window.setTimeout(() => setIsWakingUp(false), 90_000);
    };

    const isLikelyRenderSleep = (response?: Response, error?: unknown) => {
        if (response && [502, 503, 504].includes(response.status)) return true;
        if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'AbortError') return true;
        if (error instanceof TypeError) return true;
        return false;
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const name = decoded.name;
        const email = decoded.email;

        try {
            startPendingNoticeTimer();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });

            let data: any = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.ok) {
                login(data.user);
                navigate('/onboarding');
            } else if (isLikelyRenderSleep(response)) {
                showBackendWakingNotice();
            } else {
                alert(data?.detail || 'Signup failed');
            }
        } catch (error) {
            console.error("Signup failed", error);
            if (isLikelyRenderSleep(undefined, error)) {
                showBackendWakingNotice();
            } else {
                alert('Signup failed');
            }
        } finally {
            clearPendingNoticeTimer();
        }
    };

    const handleGoogleError = () => {
        console.log("Google Signup Failed");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotice(null);

        const fullName = (e.target as any).elements[0].value;
        const email = (e.target as any).elements[1].value;
        const password = (e.target as any).elements[2].value;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName, email, password })
            });

            let data: any = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.ok) {
                login(data);
                navigate('/onboarding');
            } else if (isLikelyRenderSleep(response)) {
                showBackendWakingNotice();
            } else {
                alert(data?.detail || 'Signup failed');
            }
        } catch (error) {
            console.error("Signup failed", error);
            if (isLikelyRenderSleep(undefined, error)) {
                showBackendWakingNotice();
            } else {
                alert('Signup failed');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="bg-overlay">
                <img src={uniBg} alt="University" className="bg-image" />
            </div>

            <div className="auth-card glass">
                <div className="auth-header">
                    <GraduationCap className="auth-icon" />
                    <h1 className="auth-title">Join Globalgrad</h1>
                    <p className="auth-subtitle">Create your account to start your journey</p>
                </div>

                {notice && (
                    <div className="auth-notice" role="alert">
                        {notice}
                    </div>
                )}

                <div className="auth-methods">
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            size="large"
                            width="100%"
                            text="signup_with"
                        />
                    </div>

                    <div className="divider">
                        <span>or enter details</span>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John Doe"
                                    style={{ paddingLeft: '2.5rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="name@example.com"
                                    style={{ paddingLeft: '2.5rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '2.5rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth" disabled={isWakingUp}>
                            {isWakingUp ? 'Waking server…' : 'Create Account'} <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>

            <div className="gradient-sphere" style={{ bottom: '-10%', left: '-5%' }}></div>
        </div>
    );
};

export default Signup;
