
// const rooms = {};

// export default function quizSocket(io, socket) {
//     // your socket handlers...

// }
// sockets/quizSocket.js
import RoomManager from '../utils/RoomManager.js';

export default function quizSocket(io, socket) {
  // Track player activity
  const updatePlayerPresence = (roomPin) => {
    const room = RoomManager.rooms.get(roomPin);
    if (!room) return;
      console.log(room)
      
    const players = Array.from(room.players.values()).map(player => ({
      id: player.id,
      name: player.name,
      score: player.score,
      status: 'online'
    }));

    // Broadcast to all in room
    io.to(roomPin).emit('room:players', players);
  };

  // Host creates room with quiz ID
  socket.on('host:create', async (quizId) => {
      try {
        console.log(`Host ${socket.id} is creating room for quiz ID: ${quizId}`);
      const room = await RoomManager.createRoom(socket.id, quizId);
      if (!room) {
        socket.emit('error', { message: 'Failed to create room' });
        return;
      }

      socket.join(room.pin);
      socket.emit('room:created', {
        pin: room.pin,
        quiz: {
          title: room.quiz.title,
          questionCount: room.quiz.questions.length
        }
      });

      // Initialize player list
      updatePlayerPresence(room.pin);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Player joins room
  socket.on('player:join', ({ pin, playerName, playerId }) => {
      try {
        console.log(`Player ${playerId} (${playerName}) is joining room with PIN: ${pin}`);
      const room = RoomManager.joinRoom(pin, playerId, playerName, socket.id);
      if (!room) {
        socket.emit('error', { message: 'Invalid PIN or game started' });
        return;
      }

      socket.join(room.pin);
      socket.emit('player:joined', {
        playerId,
        quizTitle: room.quiz.title,
        playerCount: room.players.size
      });

      // Notify all players in the room
      io.to(room.pin).emit('player:joined-room', {
        playerId,
        name: playerName
      });

      // Update player list
      updatePlayerPresence(room.pin);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Player leaves room voluntarily
  socket.on('player:leave', () => {
    const room = RoomManager.getRoomBySocket(socket.id);
    if (!room) return;

    const player = RoomManager.getPlayer(socket.id);
    if (!player) return;

    // Notify all players in the room
    io.to(room.pin).emit('player:left-room', {
      playerId: player.id,
      name: player.name
    });

    // Remove player
    RoomManager.removePlayer(socket.id);
    socket.leave(room.pin);

    // Update player list
    updatePlayerPresence(room.pin);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    const room = RoomManager.getRoomBySocket(socket.id);
    if (!room) return;

    const player = RoomManager.getPlayer(socket.id);

    // Host disconnected - end game
    if (socket.id === room.hostSocketId) {
      io.to(room.pin).emit('host:disconnected');
      RoomManager.endRoom(room.pin);
      return;
    }

    // Player disconnected
    if (player) {
      // Notify all players in the room
      io.to(room.pin).emit('player:disconnected', {
        playerId: player.id,
        name: player.name
      });

      RoomManager.removePlayer(socket.id);

      // Update player list
      updatePlayerPresence(room.pin);
    }
  });

  // ... rest of the existing event handlers ...

  // Request player list
  socket.on('request:players', () => {
    const room = RoomManager.getRoomBySocket(socket.id);
    if (!room) return;

    updatePlayerPresence(room.pin);
  });
}