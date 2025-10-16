const socketIo = require('socket.io');
const StreamChat = require('../models/StreamChat');
const Stream = require('../models/Stream');

module.exports = (server) => {
  const io = socketIo(server);
  
  // Namespace cho streaming
  const streamIO = io.of('/streams');
  
  streamIO.on('connection', (socket) => {
    console.log('New client connected to streams');
    
    // Người dùng tham gia phòng stream
    socket.on('join-stream', async (streamId) => {
      socket.join(streamId);
      
      // Cập nhật số lượng người xem
      try {
        await Stream.findByIdAndUpdate(streamId, {
          $inc: { viewCount: 1 }
        });
        
        // Lấy số người xem hiện tại
        const stream = await Stream.findById(streamId);
        streamIO.to(streamId).emit('viewer-count-update', stream.viewCount);
      } catch (err) {
        console.error('Error updating view count:', err);
      }
    });
    
    // Xử lý tin nhắn chat
    socket.on('chat-message', async (data) => {
      try {
        const { streamId, userId, message } = data;
        
        // Lưu tin nhắn vào database
        const chatMessage = new StreamChat({
          stream: streamId,
          user: userId,
          message
        });
        
        await chatMessage.save();
        
        // Gửi tin nhắn đến tất cả người dùng trong phòng
        streamIO.to(streamId).emit('chat-message', {
          ...data,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    });
    
    // Xử lý khi người dùng rời stream
    socket.on('leave-stream', async (streamId) => {
      socket.leave(streamId);
      
      // Giảm số lượng người xem
      try {
        await Stream.findByIdAndUpdate(streamId, {
          $inc: { viewCount: -1 }
        });
        
        // Lấy số người xem hiện tại
        const stream = await Stream.findById(streamId);
        streamIO.to(streamId).emit('viewer-count-update', stream.viewCount);
      } catch (err) {
        console.error('Error updating view count:', err);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from streams');
    });
  });
  
  return io;
}; 