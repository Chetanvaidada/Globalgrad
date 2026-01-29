import { useState, useEffect, useRef } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import SimpleVoiceAssistant from "./SimpleVoiceAssistant";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LiveKitModalProps {
    setShowSupport: (show: boolean) => void;
}

const LiveKitModal = ({ setShowSupport }: LiveKitModalProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    useAuth(); // cookie handles auth for the token endpoint
    const didFetchToken = useRef(false);

    useEffect(() => {
        if (didFetchToken.current) return;
        didFetchToken.current = true;

        const fetchToken = async () => {
            try {
                // Use the new API endpoint
                const response = await fetch(`${import.meta.env.VITE_API_URL}/voice/token`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include' // Important for backend to see HttpOnly cookies
                });

                if (!response.ok) {
                    throw new Error("Failed to get token");
                }

                const data = await response.json();
                setToken(data.token);
            } catch (e: any) {
                console.error(e);
                setError("Could not connect to Voice Server. Please try again later.");
            }
        };

        fetchToken();
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={() => setShowSupport(false)}>
                    <X size={24} />
                </button>
                <div className="support-room">
                    <h2>AI Counsellor</h2>
                    {error && <div style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</div>}
                    {!token && !error && <div style={{ textAlign: 'center' }}>Connecting...</div>}

                    {token && (
                        <LiveKitRoom
                            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
                            token={token}
                            connect={true}
                            video={false}
                            audio={true}
                            onDisconnected={() => {
                                setShowSupport(false);
                            }}
                            style={{ height: '100%' }}
                        >
                            <RoomAudioRenderer />
                            <SimpleVoiceAssistant />
                        </LiveKitRoom>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveKitModal;
