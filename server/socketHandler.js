import Message from './models/Message.js';
import Conversation from './models/Conversation.js';

let onlineUsers = [];

const addUser = (userId, socketId) => {
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getOnlineUsers', onlineUsers.map(user => user.userId));
      console.log('Online users:', onlineUsers.map(user => user.userId));
    });

    socket.on('sendMessage', async ({ conversationId, sender, receiverId, text }) => {
      try {
        const newMessage = new Message({
          conversationId,
          sender,
          text,
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate('sender', 'username profilePicture');
        
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: savedMessage._id,
        });

        const receiver = getUser(receiverId);
        
        if (receiver) {
          io.to(receiver.socketId).emit('getMessage', savedMessage);
        }
        
        io.to(socket.id).emit('getMessage', savedMessage);

      } catch (error) {
        console.error('Socket Send Message Error:', error);
      }
    });

    socket.on('typing', ({ receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('isTyping');
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('stopTyping');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      removeUser(socket.id);
      io.emit('getOnlineUsers', onlineUsers.map(user => user.userId));
    });
  });
};