Great! If you want to use Flask-SocketIO, let’s go step by step based on your use case.


---

1. Basic Flask-SocketIO Setup

First, install Flask-SocketIO if you haven't:

pip install flask-socketio eventlet

(Eventlet or Gevent is required for WebSocket support.)

Then, create a simple WebSocket server in Flask:

server.py (Flask WebSocket Server)

from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins for testing

@app.route('/')
def index():
    return "WebSocket Server Running"

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {socketio.server.eio.sid}")

@socketio.on('message')
def handle_message(message):
    print(f"Received message: {message}")
    socketio.send(f"Echo: {message}")  # Send response to the sender only

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)


---

2. Connecting from a Frontend (JavaScript Client)

Now, let’s create a simple JavaScript client that connects to the WebSocket server.

index.html (Basic WebSocket Client)

<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.js"></script>
</head>
<body>
    <h1>WebSocket Test</h1>
    <button onclick="sendMessage()">Send Message</button>
    <ul id="messages"></ul>

    <script>
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('message', (data) => {
            console.log("Received:", data);
            document.getElementById("messages").innerHTML += `<li>${data}</li>`;
        });

        function sendMessage() {
            socket.send("Hello from client!");
        }

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    </script>
</body>
</html>

How it works:

1. Opens a WebSocket connection to http://localhost:5000.


2. Sends a message when clicking the button.


3. Receives an echoed message from the server and displays it.




---

3. Handling Multiple Browser Sessions

Now, let’s test the behavior:

Open two browser tabs with index.html.

Click "Send Message" in one tab.

Only that tab receives the response.



---

4. Broadcasting Messages to All Clients

If you want all connected browsers to receive the same message, modify the server code:

Update handle_message() to Broadcast

@socketio.on('message')
def handle_message(message):
    print(f"Received message: {message}")
    socketio.send(f"Broadcast: {message}", broadcast=True)  # Send to all clients

Now, every connected client receives messages sent by any client.


---

5. Sending Messages to Specific Groups (Rooms)

If you want clients to join specific groups (rooms):

Server-Side (Group Chat)

from flask_socketio import join_room, leave_room

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    socketio.send(f"User joined {room}", room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    socketio.send(f"Room {room}: {data['message']}", room=room)

Client-Side (Joining a Room)

socket.emit('join', { room: 'chatroom1' });

function sendMessageToRoom() {
    socket.emit('message', { room: 'chatroom1', message: "Hello Room!" });
}

Now, messages only go to users in the same room.


---

Final Summary

Would you like to customize it further based on your use case?

