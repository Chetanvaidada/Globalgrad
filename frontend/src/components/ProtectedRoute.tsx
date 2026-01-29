import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** When true, redirects to /onboarding if user has not completed onboarding */
    requireOnboarded?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOnboarded = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="onboarding-container">
                <div className="onboarding-card glass" style={{ textAlign: 'center' }}>
                    <p className="onboarding-subtitle">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireOnboarded && !user.is_onboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
