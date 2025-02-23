export default function LoadingStage() {
  return (
    <div className="flex justify-center items-center relative top-[-64px]">
      <video
        src="/loading.mp4"
        autoPlay
        loop
        muted
        className="border-8 border-white rounded-2xl w-[50vw] shadow-lg"
      />
      <div className="absolute top-10 right-10 flex flex-col items-end font-quicksand">
        <p className="text-white text-shadow text-4xl font-extrabold drop-shadow-md fade-in-hold-on">
          Hold on!
        </p>
        <p className="text-white text-shadow text-3xl font-extrabold drop-shadow-md mt-2 fade-in-story">
          I'm creating a magical story...
        </p>
      </div>
    </div>
  );
}
