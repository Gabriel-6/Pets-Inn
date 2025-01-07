from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, send
import os

app = Flask(__name__, static_folder='./build/static')
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    
@socketio.on('connect')
def handle_connect():
    print("Client connected with id:", request.sid)

@socketio.on('message')
def handle_message(data):
    message = data['message']
    sender = request.sid
    send({'message': message, 'sender': sender}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000)
