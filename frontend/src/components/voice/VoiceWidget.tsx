import { useState } from "react";
import { Mic } from "lucide-react";
import LiveKitModal from "./LiveKitModal";
import { useAuth } from "../../context/AuthContext";
import "./SimpleVoiceAssistant.css";

const VoiceWidget = () => {
    const [showSupport, setShowSupport] = useState(false);
    const { user } = useAuth();

    // Only show if user is logged in
    if (!user) return null;

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
