import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../config';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children, userId = 'me' }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to backend server with error handling
    let newSocket;
    
    try {
      newSocket = io(SERVER_URL, {
        transports: ['websocket'],
        timeout: 5000,
        reconnection: false, // Don't auto-reconnect to avoid blocking
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        // Register this user with user data
        newSocket.emit('register', {
          userId,
          name: `User ${userId}`,
          email: '',
          deviceId: userId,
        });
      });

      newSocket.on('connect_error', (error) => {
        console.log('Server connection error (this is OK if server is not running):', error.message);
        setConnected(false);
        // App will work in offline mode
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });
    } catch (error) {
      console.error('Error creating socket connection:', error);
      setConnected(false);
      // App will work in offline mode
    }

    // Only set up socket listeners if socket was created successfully
    if (newSocket) {
      // Listen for requests
      newSocket.on('requests', (userRequests) => {
        setRequests(userRequests);
      });

      // Listen for new requests
      newSocket.on('newRequest', (request) => {
        setRequests(prev => {
          // Check if request already exists
          if (prev.find(r => r.id === request.id)) {
            return prev;
          }
          return [...prev, request];
        });
      });

      // Listen for time acceptances
      newSocket.on('timeAccepted', ({ requestId, friendId, acceptedTime }) => {
        setRequests(prev => prev.map(req => {
          if (req.id === requestId) {
            const updatedResponses = req.responses || {};
            updatedResponses[friendId] = {
              status: 'accepted',
              acceptedTime: acceptedTime,
            };
            return {
              ...req,
              responses: updatedResponses,
            };
          }
          return req;
        }));
      });

      // Listen for match confirmations
      newSocket.on('matchConfirmed', ({ requestId, request }) => {
        setRequests(prev => prev.map(req => 
          req.id === requestId ? request : req
        ));
      });

      // Listen for friend requests
      newSocket.on('friendRequests', (requests) => {
        setFriendRequests(requests);
      });

      newSocket.on('friendRequestReceived', (request) => {
        setFriendRequests(prev => {
          if (prev.find(r => r.id === request.id)) {
            return prev;
          }
          return [...prev, request];
        });
      });

      // Listen for friend updates
      newSocket.on('friends', (friendsList) => {
        setFriends(friendsList);
      });

      newSocket.on('friendAdded', ({ friend, friends: friendsList }) => {
        setFriends(friendsList);
      });

      setSocket(newSocket);
    }

    // Fetch friends list (non-blocking - app works without server)
    fetch(`${SERVER_URL}/api/friends/${userId}`)
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => {
        console.log('Server not available - app will work offline');
        setFriends([]);
      });

    // Fetch friend requests (non-blocking - app works without server)
    fetch(`${SERVER_URL}/api/friend-requests/${userId}`)
      .then(res => res.json())
      .then(data => setFriendRequests(data))
      .catch(err => {
        console.log('Server not available - app will work offline');
        setFriendRequests([]);
      });

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [userId]);

  const sendRequest = (requestData) => {
    if (socket && connected) {
      socket.emit('createRequest', requestData);
    } else {
      console.warn('Not connected to server');
      // Fallback to local state
      const newRequest = {
        id: Date.now().toString(),
        ...requestData,
        creatorId: userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setRequests([...requests, newRequest]);
      return newRequest;
    }
  };

  const acceptTimeProposal = (requestId, friendId, acceptedTime) => {
    if (socket && connected) {
      socket.emit('acceptTime', {
        requestId,
        friendId,
        acceptedTime,
      });
    } else {
      // Fallback to local state
      setRequests(requests.map(req => {
        if (req.id === requestId) {
          const updatedResponses = req.responses || {};
          updatedResponses[friendId] = {
            status: 'accepted',
            acceptedTime: acceptedTime,
          };
          return {
            ...req,
            responses: updatedResponses,
          };
        }
        return req;
      }));
    }
  };

  const confirmMatch = (requestId) => {
    if (socket && connected) {
      socket.emit('confirmMatch', requestId);
    } else {
      // Fallback to local state
      setRequests(requests.map(req => {
        if (req.id === requestId) {
          return { ...req, status: 'confirmed' };
        }
        return req;
      }));
    }
  };

  const generateInviteCode = () => {
    return new Promise((resolve, reject) => {
      if (socket && connected) {
        socket.emit('generateInviteCode');
        socket.once('inviteCodeGenerated', ({ code }) => {
          resolve(code);
        });
        socket.once('friendCodeError', ({ message }) => {
          reject(new Error(message));
        });
      } else {
        // Fallback: generate local code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        resolve(code);
      }
    });
  };

  const addFriend = (friend) => {
    // Check if friend already exists
    if (friends.find(f => f.id === friend.id || f.code === friend.code)) {
      return;
    }
    setFriends([...friends, friend]);
  };

  const sendFriendInvite = async () => {
    try {
      const code = await generateInviteCode();
      return code;
    } catch (error) {
      console.error('Error generating invite code:', error);
      // Fallback
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  };

  const addFriendByCode = (code, userInfo = {}) => {
    return new Promise((resolve, reject) => {
      if (socket && connected) {
        socket.emit('addFriendByCode', { code, userInfo });
        socket.once('friendRequestSent', ({ requestId }) => {
          resolve({ requestId, message: 'Friend request sent' });
        });
        socket.once('friendCodeError', ({ message }) => {
          reject(new Error(message));
        });
      } else {
        reject(new Error('Not connected to server'));
      }
    });
  };

  const acceptFriendRequest = (requestId) => {
    if (socket && connected) {
      socket.emit('acceptFriendRequest', requestId);
    } else {
      // Fallback to local state
      const request = friendRequests.find(r => r.id === requestId);
      if (request) {
        const newFriend = {
          id: request.from || request.fromId || `friend_${Date.now()}`,
          name: request.fromName || request.name || request.from,
          email: request.fromEmail || request.email || '',
          status: 'active',
        };
        addFriend(newFriend);
        setFriendRequests(friendRequests.filter(r => r.id !== requestId));
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        friends,
        requests,
        friendRequests,
        sendRequest,
        acceptTimeProposal,
        confirmMatch,
        addFriend,
        sendFriendInvite,
        addFriendByCode,
        acceptFriendRequest,
        connected,
        userId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
