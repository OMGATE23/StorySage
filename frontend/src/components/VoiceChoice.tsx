import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";

interface Props {
  selectedVoice: string | null;
  setSelectedVoice: (voice: string) => void;
}

export default function VoiceSelector({
  selectedVoice,
  setSelectedVoice,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<
    { id: string; voiceName: string; voiceId: string }[]
  >([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { getAllVoices } = useStorage();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchVoices() {
      const fetchedVoices = await getAllVoices();
      setVoices(fetchedVoices);
      if (fetchedVoices.length > 0) {
        setSelectedVoice(fetchedVoices[1].voiceId);
      }
    }
    fetchVoices();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-20" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 cursor-pointer bg-teal-100 rounded-full flex items-center justify-center border-4 border-amber-400 hover:bg-teal-200 transition"
      >
        <img src="/grandma.png" className="w-full rounded-full text-teal-600" />
      </button>

      {isOpen && (
        <div
          className="absolute right-full top-0 mr-4 w-64 animate-in fade-in duration-200"
          style={{ transformOrigin: "top right" }}
        >
          <div className="bg-white rounded-3xl p-2">
            <div className="bg-amber-400 rounded-2xl p-2">
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="bg-amber-400 py-3 px-4">
                  <div
                    className="text-white text-xl font-bold text-center"
                    style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                  >
                    CHANGE VOICE
                  </div>
                </div>

                <div className="p-3 space-y-2 max-h-[140px] overflow-y-auto">
                  {voices.length > 0 ? (
                    voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          setSelectedVoice(voice.voiceId);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl text-lg font-semibold transition  cursor-pointer ${
                          selectedVoice === voice.voiceName
                            ? "bg-amber-400 text-white"
                            : "hover:bg-slate-100"
                        } ${selectedVoice === voice.voiceId && "bg-slate-200"}`}
                      >
                        <div
                          className={`w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-4 ${selectedVoice === voice.voiceId ? "border-amber-400" : "border-transparent"}`}
                        >
                          <img
                            src={
                              voice.voiceName.toLowerCase() === "grandma"
                                ? "/grandma.png"
                                : "/grandpa.png"
                            }
                            className="w-full rounded-full text-teal-600"
                          />
                        </div>
                        {voice.voiceName}
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center">
                      No voices found
                    </div>
                  )}
                </div>

                <div className="px-3 pb-3">
                  <button
                    onClick={() => {
                      navigate("/clone");
                      setIsOpen(false);
                    }}
                    className="w-full bg-amber-400 text-white font-bold text-lg py-3 rounded-full shadow-md hover:bg-amber-500 transition"
                  >
                    Add new
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
