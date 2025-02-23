import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

const voices = [{ name: "Aunt Jo" }, { name: "Uncle Leo" }];

export default function VoiceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(voices[0].name);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Handle clicking outside to close dropdown
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
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center border-4 border-amber-400 hover:bg-teal-200 transition"
      >
        <User className="w-6 h-6 text-teal-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-full top-0 mr-4 w-64 animate-in fade-in duration-200"
          style={{ transformOrigin: "top right" }}
        >
          <div className="bg-white rounded-3xl p-2">
            <div className="bg-amber-400 rounded-2xl p-2">
              <div className="bg-slate-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-amber-400 py-3 px-4">
                  <div
                    className="text-white text-xl font-bold text-center"
                    style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                  >
                    CHANGE VOICE
                  </div>
                </div>

                {/* Voice List */}
                <div className="p-3 space-y-2">
                  {voices.map((voice) => (
                    <button
                      key={voice.name}
                      onClick={() => {
                        setSelectedVoice(voice.name);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl text-lg font-semibold transition ${
                        selectedVoice === voice.name
                          ? "bg-amber-400 text-white"
                          : "hover:bg-slate-300"
                      }`}
                    >
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center border-4 border-amber-400">
                        <User className="w-6 h-6 text-teal-600" />
                      </div>
                      {voice.name}
                    </button>
                  ))}
                </div>

                {/* Add New Button */}
                <div className="px-3 pb-3">
                  <button
                    onClick={() => setIsOpen(false)}
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
