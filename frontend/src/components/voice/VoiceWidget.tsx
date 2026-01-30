import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Mic } from "lucide-react";
import LiveKitModal from "./LiveKitModal";
import { useAuth } from "../../context/AuthContext";
import "./SimpleVoiceAssistant.css";

const VoiceWidget = () => {
    const [showSupport, setShowSupport] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    // Only show on dashboard and universities pages
    const allowedPaths = ['/dashboard', '/universities'];
    const isAllowedPage = allowedPaths.includes(location.pathname);

    // Only show if user is logged in and on allowed pages
    if (!user || !isAllowedPage) return null;

    return (
        <>
            <button
                className="voice-widget-btn"
                onClick={() => setShowSupport(true)}
                title="Talk to AI Counsellor"
            >
                <Mic size={24} />
            </button>

            {showSupport && <LiveKitModal setShowSupport={setShowSupport} />}
        </>
    );
};

export default VoiceWidget;
