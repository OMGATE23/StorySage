import fal_client
from dotenv import load_dotenv
load_dotenv()

TEXT_TO_IMAGE_PROMPT = """
A whimsical children's storybook illustration with cute, rounded cartoon characters.
- Bright and cheerful colors
- Soft, warm lighting
- Expressive and friendly character facial expressions
- Simple yet imaginative clothing
- A child-friendly, magical setting with a timeless, fairy-tale feel
- Subtle background details enhancing the storybook aesthetic
\n\n
"""


def create_image_from_text(prompt: str) -> str:
    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])

    result = fal_client.subscribe(
        "fal-ai/flux-pro/v1.1-ultra",
        arguments={
            "prompt": f"{TEXT_TO_IMAGE_PROMPT} Scene Description: {prompt}"
        },
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    return result["images"][0]["url"]


IMAGE_TO_VIDEO_PROMPT = """
Transform this scene into a short animation:
    Choose a motion style that best suits the scene from:
      - "the camera rotates around the subject"
      - "the camera is stationary"
      - "handheld device filming"
      - "the camera zooms out"
      - "the camera zooms in"
      - "the camera follows the subject moving"
"""

def create_video_from_image(image_url: str, duration:int=5):
    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])

    result = fal_client.subscribe(
        "fal-ai/kling-video/v1.6/pro/image-to-video",
        arguments={
            "prompt": IMAGE_TO_VIDEO_PROMPT,
            "image_url": image_url,
            "duration": duration
        },
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    return result["video"]["url"]

