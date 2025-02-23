import { useState, useRef, ChangeEvent } from "react";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";

export default function Clone() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { storeClonedVoice } = useStorage();
  const navigate = useNavigate();
  const validateAudioFile = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (file.size > 11 * 1024 * 1024) {
        setError("File size must not exceed 11MB");
        resolve(false);
        return;
      }

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        if (audio.duration < 10) {
          setError("Audio length must be between 10 and 30 seconds");
          resolve(false);
        } else {
          setError("");
          resolve(true);
        }
      };

      audio.onerror = () => {
        setError("Invalid audio file");
        resolve(false);
      };
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes("audio/")) {
      setError("Please upload an audio file (MP3 or WAV)");
      return;
    }

    const isValid = await validateAudioFile(selectedFile);
    if (isValid) {
      setFile(selectedFile);
    } else {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !name.trim()) return;

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("name", name);

    try {
      const response = await fetch("http://localhost:8080/clone_voice", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const addedVoice = await storeClonedVoice(result.voice_id, name);

        if (addedVoice?.id) {
          toast.success(`Voice cloned! ID: ${result.voice_id}`);
          navigate("/");
        } else {
          toast.error("Couldn't store the voice");
        }
      } else {
        console.error("Error cloning voice:", result.error);
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Failed to connect to server.");
    }
  };

  const isFormValid = name.trim() !== "" && file !== null && isAuthorized;

  return (
    <div className="w-[50vw] relative top-[-64px] mx-auto p-4 bg-white rounded-[32px] shadow-lg">
      <div className="p-8 bg-[#FFB922] rounded-[32px] shadow">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-[24px] border-12 border-amber-400"
        >
          <div className="flex items-center gap-4 rounded-[20px]">
            <div className="rounded-full outline p-2">
              <User size={24} />
            </div>
            <input
              type="text"
              placeholder="Name your voice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-3 bg-[#EFEFEF] border-none outline-none rounded-2xl font-bold placeholder-[#6B7280] text-[#111827]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="audio-upload"
                className="flex items-center gap-3 
                       rounded-2xl cursor-pointer  transition-colors duration-200"
              >
                <img src="/upload.png" className="size-12" />
                <div>
                  <span className="font-bold">
                    {file
                      ? file.name.length > 10
                        ? file.name.slice(0, 10) + "..."
                        : file.name
                      : "Upload voice sample"}
                  </span>
                  <p className="text-xs color-[#2A1E00] mt-2">
                    {"(minimum 10 seconds of audio)"}
                  </p>
                </div>
                <input
                  id="audio-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mp3,audio/wav"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {error && <p className="mt-2 text-sm text-[#EF4444]">{error}</p>}
            </div>

            <div className="flex gap-2 items-center">
              <img src="/voice_button/unavailable.png" className="size-12" />
              <div className="">
                <p className="flex gap-2 items-center font-bold">
                  Record audio <Lock size={16} />
                </p>
                <p className=" text-xs mt-1">{"(coming soon)"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="authorize"
              checked={isAuthorized}
              onChange={(e) => setIsAuthorized(e.target.checked)}
              className="w-4 h-4 rounded border-[#D1D5DB] text-[#F97316]
                     focus:ring-[#F97316] focus:ring-offset-0"
            />
            <label htmlFor="authorize" className="text-sm text-[#4B5563]">
              I confirm that I'm authorised to use this voice
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 px-6 rounded-2xl text-white font-medium text-sm
                     transition-colors duration-200 ${
                       isFormValid
                         ? "bg-[#F97316] hover:bg-[#EA580C]"
                         : "bg-[#D1D5DB] cursor-not-allowed"
                     }`}
          >
            Add voice
          </button>
        </form>
      </div>
    </div>
  );
}
