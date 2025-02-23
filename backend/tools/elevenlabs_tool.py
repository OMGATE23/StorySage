from elevenlabs.client import ElevenLabs
from elevenlabs import Voice
from dotenv import load_dotenv
import os

load_dotenv()


class ElevenLabsTool:
    def __init__(self):
        self.client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))


    def clone_audio(self, audio_files: list[str], name_of_voice, description):
        voice = self.client.clone(
            name=name_of_voice,
            files=audio_files,
            description=description
        )
        return voice

    def synthesis_text(self, voiceover:str, voice_id:str):
        audio = self.client.generate(
            text=voiceover,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )
        return audio