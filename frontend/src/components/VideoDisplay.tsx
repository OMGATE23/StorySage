import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  removeVideo: () => void;
}

export default function VideoDisplay({ src, removeVideo }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src]);

  return (
    <div className="relative top-[-64px] flex flex-col justify-center items-center p-4 gap-4">
      <video
        ref={videoRef}
        controls
        className="border-8 border-white rounded-2xl w-[50vw] shadow-lg"
      />
      <button
        onClick={removeVideo}
        className="w-[320px] cursor-pointer font-bold text-white"
      >
        <img alt="One more time?" src="/once_more.png" />
      </button>
    </div>
  );
}
