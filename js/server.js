import { WebSocketServer } from "ws";
import http from "http";
import Engine from "./engine.js";
import MAPS from "./data/maps.js";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});
const port = process.env.PORT || 10000;

const wss = new WebSocketServer({ server });
const rooms = new Map();
const engine = Engine();

// Helper: broadcast to all players in a room
function broadcast(room, message) {
  room.sockets.forEach((s,) => {
    if (s.readyState === 1) s.send(JSON.stringify(message));
  });
}

// Handle joining a room
function joinRoom(socket, roomId, team) {
  const validation = engine.validateTeam(team, "duel");
  if (!validation.result) {
    socket.send(JSON.stringify({ type: "team_invalid", reason: validation.reason }));
    return;
  }

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      sockets: new Set(),
      gameState: null,
      teams: {},
      swapDone: new Set(),
      phase: "waiting",
      playerOrder: {}
    });
  }

  const room = rooms.get(roomId);

  if (room.sockets.size >= 2) {
    socket.send(JSON.stringify({ type: "room_full" }));
    return;
  }

  socket._id = Math.random().toString(36).slice(2, 8).toUpperCase();
  socket.roomId = roomId;

  const teamIndex = room.sockets.size;

  room.sockets.add(socket);
  room.teams[teamIndex] = team;

  broadcast(room, { type: "players", count: room.sockets.size });

  // If 2 players present, initialize gameState and enter swap phase
  if (room.sockets.size === 2) {
    Array.from(room.sockets).forEach((s, i) => s.team = i);
    room.phase = "swap";
    room.swapDone = new Set();
    room.gameState = engine.newGame(MAPS.SD18, room.teams[0], room.teams[1], "duel");
    room.sockets.forEach((s,) => {
      if (s.readyState === 1) s.send(JSON.stringify({ type: "ready", playingAs: s.team, gameState: room.gameState }));
    });
  }
}

function endGame(room) {
  rooms.delete(room.id);

  room.sockets.forEach(ws => {
    ws.send(JSON.stringify({ type: "room_closed" }));
    ws.close();
  });
}


// Handle end of swap phase (client sends all swaps at once)
function handleEndSwapPhase(socket, swaps) {
  const room = rooms.get(socket.roomId);
  if (!room || room.phase !== "swap") return;

  swaps.forEach((s) => {
    // todo verify team
    engine.swapStartingPositions(room.gameState, s.posA, s.posB);
  });

  room.swapDone.add(socket.team);

  // Once both players finished swaps → start fight phase
  if (room.swapDone.size === 2) {
    room.phase = "fight";
    broadcast(room, { type: "update", updateType: "endSwapPhase", gameState: room.gameState });
  }
}

// Handle actions in fight phase
function handleAction(socket, action) {
  const room = rooms.get(socket.roomId);
  if (!room || room.phase !== "fight") return;

  if (socket.team !== room.gameState.currentTurn) {
    return;
  }

  if (!engine.isValidAction(room.gameState, action)) {
    socket.send(JSON.stringify({ type: "invalid_action", action }));
    return;
  }

  engine.executeAction(room.gameState, action);
  broadcast(room, {
    type: "update",
    updateType: "action",
    action
  });
  if (room.gameState.gameOver) {
    endGame(room);
  }
}

// Handle surrender
function handleSurrender(socket) {
  const room = rooms.get(socket.roomId);
  if (!room || !room.sockets.has(socket) || !room.gameState) return;

  engine.surrender(room.gameState, socket.team);
  broadcast(room, { type: "surrender", team: socket.team });
  endGame(room);
}

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    switch (msg.type) {
      case "join":
        const team = msg.team.map(unit => ({
          ...unit,
          skills: unit.skills.filter(skill => skill !== "")
        }));
        joinRoom(socket, msg.roomId, team);
        break;
      case "endSwapPhase":
        handleEndSwapPhase(socket, msg.swaps);
        break;
      case "action":
        handleAction(socket, msg.action);
        break;
      case "surrender":
        handleSurrender(socket);
        break;
    }
  });

  socket.on("close", () => {
    const room = rooms.get(socket.roomId);
    if (!room) return;

    handleSurrender(socket);

    room.sockets.delete(socket);

    if (room.sockets.size === 0) {
      rooms.delete(socket.roomId);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
