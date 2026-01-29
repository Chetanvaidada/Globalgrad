import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';
import './LandingPage.css';
import uniBg from './assets/uni_bg.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background Image Layer */}
      <div className="bg-overlay">
        <img src={uniBg} alt="University" className="bg-image" />
      </div>

      {/* Navigation */}
      <nav className="landing-nav glass">
        <div className="nav-content">
          <div className="logo">
            <GraduationCap className="logo-icon" />
            <span>Globalgrad</span>
          </div>
          <div className="nav-actions">
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content glass">
          <div className="badge">
            <Sparkles size={14} />
            <span>Your Personal Admission Strategist</span>
          </div>
          <h1 className="hero-title">
            Plan your study-abroad journey with a <span className="highlight">guided AI counsellor.</span>
          </h1>
          <p className="hero-description">
            From profile building to university shortlisting, get step-by-step
            guidance that turns curiosity into your university acceptance.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={18} />
            </button>
            <div className="trust-badge">
              <ShieldCheck size={16} />
              <span>Data-driven & Verified</span>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Spheres */}
      <div className="gradient-sphere" style={{ top: '-10%', right: '-5%' }}></div>
      <div className="gradient-sphere" style={{ bottom: '-10%', left: '-5%' }}></div>
    </div>
  );
};

export default LandingPage;
