import openai
import json
import math
from typing import List
from video_dataclasses import VisualStyle
import os
from dotenv import load_dotenv

class ChatGPT:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("CHATGPT_API_KEY"))
        self.max_duration = 5 

    def generate_scene_sequence(self, storyline: str) -> List[dict]:
        """Generate 8 scenes with narrative and illustration consistency for a children's storybook."""
        sequence_prompt = f"""
        Break this storyline into 8 distinct scenes that reflect the following illustration style:

        Storyline: {storyline}

        Return a JSON array of scenes where each scene includes:
        [
            {{
                "story_beat": "A brief description of the scene",
                "scene_description": "Detailed depiction tailored for a children's storybook illustration",
                "suggested_duration": "Duration in seconds (as an integer, max {self.max_duration})"
            }}
        ]
        Make sure suggested_duration is a number, not a string.
        """

        response = self.client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": sequence_prompt}
            ],
            response_format={"type": "json_object"}
        )
        try:
            scenes_data = json.loads(response.choices[0].message.content).get("scenes", [])
            for scene in scenes_data:
                try:
                    scene["suggested_duration"] = int(scene.get("suggested_duration", 5))
                except (ValueError, TypeError):
                    scene["suggested_duration"] = 5
            return scenes_data
        except (KeyError, json.JSONDecodeError):
            return [{"error": "Failed to parse response"}]

    def generate_audio_prompt(self, storyline: str, scenes: List[dict]) -> str:
        """Generate a narration script for a children's storybook voiceover."""
        scenes_len = [float(scene.get("suggested_duration", 0)) for scene in scenes]
        total_duration = sum(scenes_len)
        char_per_sec = 13
        max_characters = round(math.floor(total_duration) * char_per_sec)

        audio_prompt = f"""
        Write a gentle and engaging narration for a children's storybook based on this tale:
        "{storyline}"

        IMPORTANT: The narration must be exactly {max_characters} characters long.

        Guidelines:
        - Use a warm, friendly tone ideal for young audiences.
        - Keep the language simple with short, clear sentences.
        - Avoid dramatic or complex phrasing; focus on clarity and whimsy.
        - Do not include any scene labels, only the narration text.
        - Ensure the pace matches a video of {total_duration} seconds across {len(scenes)} scenes.

        EXAMPLE:
        For a tale titled "The Little Star's Journey", a fitting narration might be:
        "Once upon a time, a little star fell from the sky, lighting up a quiet village with hope and wonder."
        """

        response = self.client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": audio_prompt}
            ],
        )

        return response.choices[0].message.content.strip()
