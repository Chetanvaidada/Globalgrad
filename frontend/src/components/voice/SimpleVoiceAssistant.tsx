import {

    useVoiceAssistant,

    BarVisualizer,

    VoiceAssistantControlBar,

    useTrackTranscription,

    useLocalParticipant,

} from "@livekit/components-react";

import { Track, Participant } from "livekit-client";

import { useEffect, useState } from "react";

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



    useEffect(() => {

        const allMessages = [

            ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),

            ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),

        ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);

        setMessages(allMessages);

    }, [agentTranscriptions, userTranscriptions]);



    return (

        <div className="voice-assistant-container">

            <div className="visualizer-container">

                <BarVisualizer state={state} barCount={7} trackRef={audioTrack} style={{ height: "200px", width: "100%" }} />

            </div>

            <div className="control-section">

                <VoiceAssistantControlBar />

            </div>

            <div className="conversation">

                {messages.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>Say "Hello" to start...</div>}

                {messages.map((msg, index) => (

                    <Message key={msg.id || index} type={msg.type} text={msg.text} />

                ))}

            </div>

        </div>

    );

};



export default SimpleVoiceAssistant;

