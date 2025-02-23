import { useState } from "react";
import VoiceChoice from "./VoiceChoice";

export default function MakeStory() {
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/mp3" });
        await sendAudioForTranscription(audioBlob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.mp3");

      const response = await fetch("http://127.0.0.1:8080/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setInputValue(data.transcription);
    } catch (error) {
      console.error("Error during transcription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative top-[-64px] w-[100%] px-12 h-[408px] bg-[#0A324E] bg-gradient-to-b from-black/45 to-[rgba(0,0,0,0.1)]/45 border-[10px] border-white rounded-[48px] shadow-[0_11px_15px_rgba(0,0,0,0.25),0_9px_46px_rgba(0,0,0,0.5)] flex flex-col justify-center p-6">
      <h2 className="text-white text-4xl font-bold text-center">
        WHAT'S THE STORY ON YOUR MIND?
      </h2>

      <div className="flex items-center bg-[#002438] bg-gradient-to-b from-black/25 to-[rgba(0,0,0,0.2)/25 border-b-[3px] border-fuchsia-950 rounded-[2rem] mt-6 px-4 py-3 w-full shadow-md">
        <VoiceChoice />

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-transparent font-bold text-white text-lg outline-none ml-8 placeholder:text-white/70"
          placeholder={
            isLoading
              ? "Let's see what you said..."
              : isRecording
                ? "Listening..."
                : "Tell me a story about..."
          }
        />

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          disabled={isLoading}
          className="w-18 h-18 transition-opacity hover:cursor-pointer"
        >
          <img
            src={`/voice_button/${isRecording ? "recording.svg" : "normal.svg"}`}
            alt="Voice Input"
          />
        </button>
      </div>

      <button
        disabled={!inputValue.trim()}
        className="w-full mt-6 flex justify-center items-center hover:cursor-pointer"
      >
        <img
          src={`/create_button/${inputValue.trim() ? "normal.svg" : "disabled.svg"}`}
          alt="Create"
        />
      </button>
    </div>
  );
}
