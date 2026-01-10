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
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to backend server
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      // Register this user
      newSocket.emit('register', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

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

    // Fetch friends list
    fetch(`${SERVER_URL}/api/friends/${userId}`)
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => {
        console.error('Error fetching friends:', err);
        // Start with empty friends list
        setFriends([]);
      });

    setSocket(newSocket);

    return () => {
      newSocket.close();
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

  return (
    <AppContext.Provider
      value={{
        friends,
        requests,
        sendRequest,
        acceptTimeProposal,
        confirmMatch,
        connected,
        userId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
