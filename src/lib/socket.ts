import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token?: string): Socket => {
  if (!socket) {
    const finalToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: {
        token: finalToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event type definitions
export const SOCKET_EVENTS = {
  // Attendance
  ATTENDANCE_CHECKED_IN: 'attendance:checked-in',
  ATTENDANCE_CHECKED_OUT: 'attendance:checked-out',
  ATTENDANCE_UPDATED: 'attendance:updated',
  
  // Classes
  CLASS_STARTED: 'class:started',
  CLASS_ENDED: 'class:ended',
  CLASS_REMINDER: 'class:reminder',
  
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // Messages
  MESSAGE_NEW: 'message:new',
  
  // Forum
  FORUM_NEW_POST: 'forum:new-post',
  FORUM_NEW_REPLY: 'forum:new-reply',
  FORUM_POST_UPDATED: 'forum:post-updated',
  
  // Assignments
  ASSIGNMENT_NEW: 'assignment:new',
  ASSIGNMENT_GRADED: 'assignment:graded',
  
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
} as const;

export default { initSocket, getSocket, disconnectSocket, SOCKET_EVENTS };
