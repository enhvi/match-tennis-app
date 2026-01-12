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
let users = {}; // userId -> { id, name, email, deviceId }
let requests = {}; // requestId -> request data
let friends = {}; // userId -> [friend objects]
let friendRequests = {}; // requestId -> { from, to, status, code }
let inviteCodes = {}; // code -> { userId, createdAt, expiresAt }
let userInviteCodes = {}; // userId -> code

// Helper function to generate invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Helper function to get or create user
const getOrCreateUser = (userId, userData = {}) => {
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      name: userData.name || `User ${userId}`,
      email: userData.email || '',
      deviceId: userData.deviceId || userId,
      createdAt: new Date().toISOString(),
    };
  }
  return users[userId];
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (data) => {
    const userId = typeof data === 'string' ? data : data.userId;
    const userData = typeof data === 'object' ? data : {};
    
    users[socket.id] = userId;
    socket.userId = userId;
    
    // Get or create user
    getOrCreateUser(userId, userData);
    
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    // Send current requests to the user
    const userRequests = Object.values(requests).filter(req => 
      req.friendIds && req.friendIds.includes(userId) || req.creatorId === userId
    );
    socket.emit('requests', userRequests);
    
    // Send friend requests
    const pendingRequests = Object.values(friendRequests).filter(req => 
      req.to === userId && req.status === 'pending'
    );
    socket.emit('friendRequests', pendingRequests);
    
    // Send friends list
    socket.emit('friends', friends[userId] || []);
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

  // Generate invite code
  socket.on('generateInviteCode', () => {
    const userId = socket.userId;
    let code = userInviteCodes[userId];
    
    // Check if existing code is still valid (24 hours)
    if (code && inviteCodes[code]) {
      const expiresAt = new Date(inviteCodes[code].expiresAt);
      if (expiresAt > new Date()) {
        socket.emit('inviteCodeGenerated', { code });
        return;
      }
    }
    
    // Generate new code
    code = generateInviteCode();
    while (inviteCodes[code]) {
      code = generateInviteCode();
    }
    
    inviteCodes[code] = {
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    userInviteCodes[userId] = code;
    
    socket.emit('inviteCodeGenerated', { code });
    console.log(`Invite code ${code} generated for user ${userId}`);
  });

  // Add friend by code
  socket.on('addFriendByCode', (data) => {
    const { code, userInfo } = data;
    const userId = socket.userId;
    const invite = inviteCodes[code];
    
    if (!invite) {
      socket.emit('friendCodeError', { message: 'Invalid code' });
      return;
    }
    
    // Check if code expired
    if (new Date(invite.expiresAt) < new Date()) {
      socket.emit('friendCodeError', { message: 'Code expired' });
      delete inviteCodes[code];
      return;
    }
    
    const fromUserId = invite.userId;
    
    // Can't add yourself
    if (fromUserId === userId) {
      socket.emit('friendCodeError', { message: 'Cannot add yourself' });
      return;
    }
    
    // Check if already friends
    const userFriends = friends[userId] || [];
    if (userFriends.find(f => f.id === fromUserId)) {
      socket.emit('friendCodeError', { message: 'Already friends' });
      return;
    }
    
    // Create friend request
    const requestId = `fr_${Date.now()}_${userId}`;
    const fromUser = users[fromUserId] || getOrCreateUser(fromUserId);
    
    friendRequests[requestId] = {
      id: requestId,
      from: fromUserId,
      to: userId,
      fromName: fromUser.name,
      fromEmail: fromUser.email,
      status: 'pending',
      code,
      createdAt: new Date().toISOString(),
    };
    
    // Notify the user who generated the code
    io.sockets.sockets.forEach((socket) => {
      if (socket.userId === fromUserId) {
        socket.emit('friendRequestReceived', friendRequests[requestId]);
      }
    });
    
    socket.emit('friendRequestSent', { requestId });
    console.log(`Friend request created: ${fromUserId} -> ${userId} (code: ${code})`);
  });

  // Accept friend request
  socket.on('acceptFriendRequest', (requestId) => {
    const request = friendRequests[requestId];
    if (!request || request.to !== socket.userId) {
      socket.emit('friendRequestError', { message: 'Invalid request' });
      return;
    }
    
    request.status = 'accepted';
    
    const fromUser = users[request.from] || getOrCreateUser(request.from);
    const toUser = users[request.to] || getOrCreateUser(request.to);
    
    // Add to both friends lists
    if (!friends[request.from]) friends[request.from] = [];
    if (!friends[request.to]) friends[request.to] = [];
    
    // Check if already added
    if (!friends[request.from].find(f => f.id === request.to)) {
      friends[request.from].push({
        id: request.to,
        name: toUser.name,
        email: toUser.email,
        status: 'active',
      });
    }
    
    if (!friends[request.to].find(f => f.id === request.from)) {
      friends[request.to].push({
        id: request.from,
        name: fromUser.name,
        email: fromUser.email,
        status: 'active',
      });
    }
    
    // Notify both users
    const fromUserSockets = Object.keys(users).filter(sid => {
      const socket = io.sockets.sockets.get(sid);
      return socket && socket.userId === request.from;
    });
    fromUserSockets.forEach(sid => {
      io.to(sid).emit('friendAdded', {
        friend: friends[request.from].find(f => f.id === request.to),
        friends: friends[request.from],
      });
    });
    
    socket.emit('friendAdded', {
      friend: friends[request.to].find(f => f.id === request.from),
      friends: friends[request.to],
    });
    
    // Remove the request
    delete friendRequests[requestId];
    
    console.log(`Friend request accepted: ${request.from} <-> ${request.to}`);
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
    req.friendIds && req.friendIds.includes(userId) || req.creatorId === userId
  );
  res.json(userRequests);
});

app.get('/api/friend-requests/:userId', (req, res) => {
  const { userId } = req.params;
  const userFriendRequests = Object.values(friendRequests).filter(req => 
    req.to === userId && req.status === 'pending'
  );
  res.json(userFriendRequests);
});

app.post('/api/users', (req, res) => {
  const { userId, name, email, deviceId } = req.body;
  const user = getOrCreateUser(userId, { name, email, deviceId });
  res.json(user);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Tennis App Server running on http://localhost:${PORT}`);
  console.log(`📱 Connect your app to: http://YOUR_COMPUTER_IP:${PORT}`);
  console.log(`\nTo find your IP address:`);
  console.log(`Windows: ipconfig (look for IPv4 Address)`);
  console.log(`Mac/Linux: ifconfig or ip addr`);
});
