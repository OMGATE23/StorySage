from flask import Flask, request, jsonify
from flask_cors import CORS
from elevenlabs.client import ElevenLabs
from werkzeug.utils import secure_filename
from core.movie_generator import MovieGenerator
import whisper
import os

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'temp'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


client = ElevenLabs()
model = whisper.load_model("base")
@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(audio_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(file_path)
    try:
        result = model.transcribe(file_path)
        transcription = result['text']
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(file_path)

    return jsonify({"transcription": transcription})

@app.route('/clone_voice', methods=['POST'])
def clone_voice():
    if 'audio' not in request.files or 'name' not in request.form:
        return jsonify({"error": "Audio file and name are required"}), 400
    
    audio_file = request.files['audio']
    name_of_voice = request.form['name']
    description = request.form.get('description', 'Cloned voice')
    
    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(audio_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(file_path)
    
    try:
        voice = client.clone(name=name_of_voice, files=[file_path], description=description)
        cloned_voice_id = voice.voice_id
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(file_path)
    
    return jsonify({"success": True, "voice_id": cloned_voice_id})


@app.route('/make_movie', methods=['POST'])
def make_movie():
    try:
        if not request.is_json:
            return jsonify({"error": "Invalid input: Expected JSON format"}), 400

        data = request.get_json()
        story_prompt = data.get('story_prompt')
        voice_id = data.get('voice_id')

        if not story_prompt or not voice_id:
            return jsonify({"error": "Missing 'story_prompt' or 'voice_id' in the request"}), 400

        movie_maker = MovieGenerator()
        video_link = movie_maker.create_movie(story_prompt, voice_id)
        video_link = "https://stream.videodb.io/v3/published/manifests/5aae2bed-1e17-4c44-8fef-61407497b419.m3u8"
        return jsonify({"video_link": video_link}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
