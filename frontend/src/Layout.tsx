import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="relative h-[100dvh] flex justify-center items-center overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex flex-col gap-0 justify-center items-center">
        <img src="/logo.png" className="w-[320px]" />
        <Outlet />
      </div>
    </div>
  );
}
