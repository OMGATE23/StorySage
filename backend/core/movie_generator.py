from tools.chatgpt_tool import ChatGPT
from tools.fal_tool import create_image_from_text, create_video_from_image
from tools.elevenlabs_tool import ElevenLabsTool
import uuid
from typing import List
import json
import os
import videodb
from videodb.timeline import Timeline
from videodb.asset import VideoAsset, AudioAsset
class MovieGenerator:
    def __init__(self):
        self.chatgpt = ChatGPT()
        self.conn = videodb.connect(api_key=os.getenv("VIDEODB_API_KEY"))
        self.elevenlabs = ElevenLabsTool()


    def upload_video(self, video_url):
        coll = self.conn.get_collection()
        video = coll.upload(url=video_url, media_type="video")
        return video
    
    def upload_audio(self, audio_path):
        coll = self.conn.get_collection()
        audio = coll.upload(file_path=audio_path, media_type="audio")
        return audio
    
    def make_final_video(
        self, scenes: List[dict], voiceover_audio_id: str
    ) -> str:
        timeline = Timeline(self.conn)

        for scene in scenes:
            video_asset = VideoAsset(asset_id=scene["video"]["id"])
            timeline.add_inline(video_asset)

        voiceover_asset = AudioAsset(
            asset_id=voiceover_audio_id
        )
        timeline.add_overlay(0, voiceover_asset)

        return timeline.generate_stream()

    def get_video_prompt(prompt):
        return prompt
    
    def create_movie(self, story_prompt, voice_id):
        scenes = self.chatgpt.generate_scene_sequence(story_prompt)


        uploaded_videos = []

        for index, scene in enumerate(scenes):
            image_url = create_image_from_text(scene["scene_description"])

            duration = scene.get("suggested_duration", 5)
            video_url = create_video_from_image(image_url, duration=duration)
            video = self.upload_video(video_url)
            uploaded_videos.append(video)

        for index, video in enumerate(uploaded_videos):
            scenes[index]["video"] = video

        voiceover_description = self.chatgpt.generate_audio_prompt(story_prompt, scenes)
        os.makedirs('temp', exist_ok=True)
        voiceover_path = f"temp/{str(uuid.uuid4())}.mp3"
        audio = self.elevenlabs.synthesis_text(voice_id=voice_id, voiceover=voiceover_description)
        with open(voiceover_path, "wb") as f:
                for chunk in audio:
                    if chunk:
                        f.write(chunk)

        uploaded_audio = self.upload_audio(audio_path=voiceover_path)
        os.remove(voiceover_path)

        generated_video = self.make_final_video(scenes, uploaded_audio.id)

        return generated_video