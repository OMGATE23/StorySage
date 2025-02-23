import { useState } from "react";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/make_movie`;

const useMovieGenerator = () => {
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovie = async (storyPrompt: string, voiceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story_prompt: storyPrompt, voice_id: voiceId }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setVideoLink(data.video_link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  function removeVideoLink() {
    setVideoLink(null);
  }

  return { videoLink, fetchMovie, loading, error, removeVideoLink };
};

export default useMovieGenerator;
