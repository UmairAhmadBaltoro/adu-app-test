from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

CHAT_FLOW_FILE = 'chat_flow.json'


def load_chat_flow():
    if os.path.exists(CHAT_FLOW_FILE):
        try:
            with open(CHAT_FLOW_FILE, 'r') as file:
                return json.load(file)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from {CHAT_FLOW_FILE}: {e}")
    else:
        print(f"File {CHAT_FLOW_FILE} does not exist.")
    return []

def save_chat_flow(chat_flow):
    with open(CHAT_FLOW_FILE, 'w') as file:
        json.dump(chat_flow, file, indent=4)  # Add indent parameter for structured format

@app.route('/api/chatflow', methods=['GET'])
def get_chatflow():
    chat_flow = load_chat_flow()
    return jsonify(chat_flow)

@app.route('/api/chatflow', methods=['POST'])
def save_chatflow():
    chat_flow = request.json
    save_chat_flow(chat_flow)
    return jsonify({"status": "success"}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(port=5000)
