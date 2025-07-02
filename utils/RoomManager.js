class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerSessions = new Map();
  }

  async createRoom(hostSocketId, quizId) {
    try {
      // In a real implementation, you would fetch from MongoDB
      // const quiz = await Quiz.findById(quizId).lean();
      const quiz = {
        _id: quizId,
        title: "Sample Quiz",
        questions: [
          {
            questionText: "What is the output of: `typeof null`?",
            options: ["'object'", "'null'", "'undefined'", "'number'"],
            correctAnswer: 0,
            timeLimit: 30,
          },
          {
            questionText:
              "Which keyword is used to create a constant in JavaScript?",
            options: ["let", "var", "const", "define"],
            correctAnswer: 2,
            timeLimit: 30,
          },
          {
            questionText: "What will this code log? `console.log([] + [])`",
            options: ["[]", "0", "'[object Object]'", "'' (empty string)"],
            correctAnswer: 3,
            timeLimit: 30,
          },
          {
            questionText:
              "Which method converts a JSON string into a JavaScript object?",
            options: [
              "JSON.parse()",
              "JSON.stringify()",
              "JSON.toObject()",
              "parse.JSON()",
            ],
            correctAnswer: 0,
            timeLimit: 30,
          },
          {
            questionText: "What is the result of `2 + '2'`?",
            options: ["4", "'22'", "NaN", "undefined"],
            correctAnswer: 1,
            timeLimit: 30,
          },
          {
            questionText:
              "Which of the following is NOT a JavaScript data type?",
            options: ["Boolean", "String", "Float", "Undefined"],
            correctAnswer: 2,
            timeLimit: 30,
          },
          {
            questionText: "How do you define a function in JavaScript?",
            options: [
              "function:myFunc()",
              "function = myFunc()",
              "function myFunc()",
              "def myFunc()",
            ],
            correctAnswer: 2,
            timeLimit: 30,
          },
          {
            questionText: "What will `Boolean('')` return?",
            options: ["true", "false", "undefined", "null"],
            correctAnswer: 1,
            timeLimit: 30,
          },
          {
            questionText: "What is a closure in JavaScript?",
            options: [
              "A function with no return value",
              "A function inside a loop",
              "A function that remembers variables from its lexical scope",
              "A recursive function",
            ],
            correctAnswer: 2,
            timeLimit: 30,
          },
          {
            questionText:
              "What is the correct syntax to import a module in ES6?",
            options: [
              "include('module')",
              "require('module')",
              "import module from 'module'",
              "using module from 'module'",
            ],
            correctAnswer: 2,
            timeLimit: 30,
          },
        ],
      };

      const pin = this.generatePin();
      const room = {
        pin,
        hostSocketId,
        quiz,
        players: new Map(),
        state: {
          status: "waiting", // waiting/active/review
          currentQuestion: 0,
          timer: null,
          leaderboard: [],
        },
      };

      this.rooms.set(pin, room);
      return room;
    } catch (error) {
      console.error("Room creation error:", error);
      return null;
    }
  }

  joinRoom(pin, playerId, playerName, socketId) {
    const room = this.rooms.get(pin);
    if (!room || room.state.status !== "waiting") return null;

    room.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      answers: [],
    });

    this.playerSessions.set(socketId, { pin, playerId });
    return room;
  }

  getRoomBySocket(socketId) {
    const session = this.playerSessions.get(socketId);
    return session ? this.rooms.get(session.pin) : null;
  }

  getPlayer(socketId) {
    const session = this.playerSessions.get(socketId);
    if (!session) return null;

    const room = this.rooms.get(session.pin);
    return room.players.get(session.playerId);
  }

  removePlayer(socketId) {
    const session = this.playerSessions.get(socketId);
    if (!session) return;

    const room = this.rooms.get(session.pin);
    if (room) {
      room.players.delete(session.playerId);
      this.updateLeaderboard(room);
    }
    this.playerSessions.delete(socketId);
  }

  updateLeaderboard(room) {
    room.state.leaderboard = [...room.players.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  generatePin() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  endRoom(pin) {
    this.rooms.delete(pin);
  }
}

export default new RoomManager();
