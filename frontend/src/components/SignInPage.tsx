import { JSX } from "react";
import Logout from "./Logout";

interface Props {
  children: JSX.Element;
}
export default function SignInPageTemplate(props: Props) {
  return (
    <div className="relative h-[100dvh] flex justify-center items-center overflow-hidden">
      <Logout />
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
        <div className="relative top-[-64px]">{props.children}</div>
      </div>
    </div>
  );
}
