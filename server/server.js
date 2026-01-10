const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let users = {};
let requests = {};
let friends = {
  'user1': [
    { id: 'user2', name: 'Friend 1', email: 'friend1@example.com' },
    { id: 'user3', name: 'Friend 2', email: 'friend2@example.com' },
  ],
  'user2': [
    { id: 'user1', name: 'You', email: 'you@example.com' },
    { id: 'user3', name: 'Friend 2', email: 'friend2@example.com' },
  ],
  'user3': [
    { id: 'user1', name: 'You', email: 'you@example.com' },
    { id: 'user2', name: 'Friend 1', email: 'friend1@example.com' },
  ],
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    users[socket.id] = userId;
    socket.userId = userId;
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    // Send current requests to the user
    const userRequests = Object.values(requests).filter(req => 
      req.friendIds.includes(userId) || req.creatorId === userId
    );
    socket.emit('requests', userRequests);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id];
  });

  // Create a new request
  socket.on('createRequest', (requestData) => {
    const requestId = Date.now().toString();
    const newRequest = {
      id: requestId,
      ...requestData,
      creatorId: socket.userId,
      status: 'pending',
      responses: {},
      createdAt: new Date().toISOString(),
    };
    
    requests[requestId] = newRequest;
    
    // Notify all invited friends
    requestData.friendIds.forEach(friendId => {
      io.emit('newRequest', newRequest);
    });
    
    // Also notify the creator
    socket.emit('requestCreated', newRequest);
    
    console.log(`Request ${requestId} created by ${socket.userId}`);
  });

  // Accept a time proposal
  socket.on('acceptTime', (data) => {
    const { requestId, friendId, acceptedTime } = data;
    const request = requests[requestId];
    
    if (request) {
      if (!request.responses) {
        request.responses = {};
      }
      request.responses[friendId] = {
        status: 'accepted',
        acceptedTime: acceptedTime,
      };
      
      // Notify the creator
      io.emit('timeAccepted', {
        requestId,
        friendId,
        acceptedTime,
      });
      
      console.log(`Friend ${friendId} accepted time ${acceptedTime} for request ${requestId}`);
    }
  });

  // Confirm match
  socket.on('confirmMatch', (requestId) => {
    const request = requests[requestId];
    if (request && request.creatorId === socket.userId) {
      request.status = 'confirmed';
      
      // Notify all participants
      io.emit('matchConfirmed', {
        requestId,
        request,
      });
      
      console.log(`Match confirmed for request ${requestId}`);
    }
  });
});

// REST API endpoints
app.get('/api/friends/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(friends[userId] || []);
});

app.get('/api/requests/:userId', (req, res) => {
  const { userId } = req.params;
  const userRequests = Object.values(requests).filter(req => 
    req.friendIds.includes(userId) || req.creatorId === userId
  );
  res.json(userRequests);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Tennis App Server running on http://localhost:${PORT}`);
  console.log(`📱 Connect your app to: http://YOUR_COMPUTER_IP:${PORT}`);
  console.log(`\nTo find your IP address:`);
  console.log(`Windows: ipconfig (look for IPv4 Address)`);
  console.log(`Mac/Linux: ifconfig or ip addr`);
});
