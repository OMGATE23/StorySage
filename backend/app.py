from flask import Flask, request, jsonify
from flask_cors import CORS
from elevenlabs.client import ElevenLabs
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


client = ElevenLabs()

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
