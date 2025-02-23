import { useEffect, useState } from "react";
import VoiceChoice from "../../components/VoiceChoice";
import { useUser } from "@clerk/clerk-react";
import useMovieGenerator from "../../hooks/useMovieGenerator";
import { toast } from "sonner";
import LoadingStage from "../../components/LoadingStage";
import VideoDisplay from "../../components/VideoDisplay";

const TRANSCRIBE_URL = `${import.meta.env.VITE_BACKEND_URL}/transcribe`;

export default function MakeStory() {
  const { isLoaded } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const {
    videoLink,
    fetchMovie,
    loading: movieLoading,
    error: movieError,
    removeVideoLink,
  } = useMovieGenerator();

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

      const response = await fetch(TRANSCRIBE_URL, {
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

  useEffect(() => {
    if (movieError) {
      toast.error(movieError);
    }
  }, [movieError]);

  if (!isLoaded) {
    return <></>;
  }

  if (movieLoading) {
    return <LoadingStage />;
  }

  if (!movieLoading && videoLink) {
    return <VideoDisplay src={videoLink} removeVideo={removeVideoLink} />;
  }

  return (
    <>
      <div className="relative top-[-64px] w-[50vw] px-12 h-[408px] bg-[#0A324E] bg-gradient-to-b from-black/45 to-[rgba(0,0,0,0.0)]/45 border-[10px] border-white rounded-[48px] shadow-[0_11px_15px_rgba(0,0,0,0.25),0_9px_46px_rgba(0,0,0,0.5)] flex flex-col justify-center p-6">
        <h2 className="text-[#F0AC2A] text-4xl font-bold text-center font-quicksand">
          What story would you like?
        </h2>
        <p className="text-white">{videoLink}</p>

        <div className="flex items-center bg-[#002438] bg-gradient-to-b from-black/25 to-[rgba(0,0,0,0.2)/25 shadow-2xl rounded-[2rem] mt-6 px-4 py-3 w-full">
          <VoiceChoice
            selectedVoice={selectedVoice}
            setSelectedVoice={(voice) => setSelectedVoice(voice)}
          />

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
          onClick={() => {
            if (inputValue.trim() && selectedVoice) {
              setInputValue("");
              fetchMovie(inputValue, selectedVoice);
            }
          }}
          className="w-full mt-6 flex justify-center items-center hover:cursor-pointer"
        >
          <img
            src={`/create_button/${inputValue.trim() ? "normal.svg" : "disabled.svg"}`}
            alt="Create"
          />
        </button>
      </div>
      <img src="/backdrop.png" className="fixed bottom-0 left-0 w-[360px]" />
    </>
  );
}
