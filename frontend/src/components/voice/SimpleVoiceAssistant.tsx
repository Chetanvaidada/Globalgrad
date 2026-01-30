import {

    useVoiceAssistant,

    BarVisualizer,

    VoiceAssistantControlBar,

    useTrackTranscription,

    useLocalParticipant,
    useRoomContext,
} from "@livekit/components-react";

import { Track, Participant, RoomEvent } from "livekit-client";

import { useEffect, useState, useRef } from "react";

import "./SimpleVoiceAssistant.css";



const Message = ({ type, text }: { type: "agent" | "user"; text: string }) => {

    return (

        <div className={`message message-${type}`}>

            <span className="message-label">{type === "agent" ? "AI Counsellor" : "You"}</span>

            <span className="message-text">{text}</span>

        </div>

    );

};



const SimpleVoiceAssistant = () => {

    const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();

    const localParticipant = useLocalParticipant();

    const microphonePublication = localParticipant.microphoneTrack;

    const { segments: userTranscriptions } = useTrackTranscription({

        publication: microphonePublication,

        source: Track.Source.Microphone,

        participant: localParticipant.localParticipant as Participant, // Type assertion if needed

    });



    const [messages, setMessages] = useState<any[]>([]);
    const conversationRef = useRef<HTMLDivElement>(null);



    useEffect(() => {

        const allMessages = [

            ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),

            ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),

        ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);

        setMessages(allMessages);

    }, [agentTranscriptions, userTranscriptions]);

    const room = useRoomContext();

    useEffect(() => {
        if (!room) return;

        const onDataReceived = (payload: Uint8Array, _participant?: Participant, _kind?: any, topic?: string) => {
            if (topic === "university_update") {
                const decoder = new TextDecoder();
                const strData = decoder.decode(payload);
                try {
                    const data = JSON.parse(strData);
                    console.log("Received university update:", data);
                    // Dispatch global event for other components to refresh
                    window.dispatchEvent(new Event('university-update'));
                } catch (e) {
                    console.error("Failed to parse data message", e);
                }
            }
        };

        room.on(RoomEvent.DataReceived, onDataReceived);
        return () => {
            room.off(RoomEvent.DataReceived, onDataReceived);
        };
    }, [room]);


    // Auto-scroll to bottom when messages update
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [messages]);



    return (

        <div className="voice-assistant-container">

            <div className="visualizer-container">

                <BarVisualizer state={state} barCount={7} trackRef={audioTrack} style={{ height: "200px", width: "100%" }} />

            </div>

            <div className="control-section">

                <VoiceAssistantControlBar />

            </div>

            <div className="conversation" ref={conversationRef}>

                {messages.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>Please wait a few seconds for the bot to start speaking...</div>}

                {messages.map((msg, index) => (

                    <Message key={msg.id || index} type={msg.type} text={msg.text} />

                ))}

            </div>
        </div>

    );

};



export default SimpleVoiceAssistant;

