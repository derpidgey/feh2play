import { html, useState, useRef } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import GameOver from "./GameOver.js";

const SERVER_URL = window.location.hostname === "127.0.0.1" ? "ws://localhost:10000" : "wss://feh2play.onrender.com";

const Online = ({ onExit }) => {
  const [status, setStatus] = useState("idle");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const playingAsRef = useRef(null);
  const [update, setUpdate] = useState(null);
  const [gameResult, setGameResult] = useState("suck");

  const savedTeams = JSON.parse(localStorage.getItem("teams") || "[]")
    .filter(team => team.mode === "sd");

  const joinRoom = () => {
    if (!selectedTeam) return alert("Please select a team first!");
    const id = roomId.trim() || Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomId(id);
    setStatus("connecting");

    const ws = new WebSocket(SERVER_URL);
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        roomId: id,
        team: selectedTeam.units
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "players") setStatus("waiting");
      if (msg.type === "ready") {
        playingAsRef.current = msg.playingAs;
        setGameState(msg.gameState);
        setStatus("battle");
      }
      if (msg.type === "update") {
        setUpdate(msg);
      }
      if (msg.type === "surrender") {
        if (msg.team !== playingAsRef.current) {
          handleBattleEnd("Opponent has surrendered", 0);
        }
      }
    };
  };

  const exit = () => {
    if (socket) {
      socket.close();
    }
    onExit();
  }

  const handleBattleEnd = (result, delay = 1000) => {
    setTimeout(() => {
      if (socket) socket.close();
      setStatus("gameOver");
      setGameResult(result);
    }, delay);
  };

  if (status === "battle") {
    return html`
    <${Game}
      initialGameState=${gameState}
      playingAs=${playingAsRef.current}
      onGameOver=${handleBattleEnd}
      socket=${socket}
      incomingUpdate=${update}
    />`;
  }

  return html`
  <div class="screen">
    ${(status === "idle" || status === "connecting" || status === "waiting") && html`
      <div class="p-3 text-center d-flex flex-column" style="height: 100%;">
        <h2 class="mb-4">Online</h2>
        ${status === "idle" && html`
          <div class="mb-3">
            <label for="teamSelect" class="form-label fw-semibold">Select Your Team:</label>
            <select 
              id="teamSelect" 
              class="form-select form-select-lg text-center"
              onChange=${e => setSelectedTeam(savedTeams[e.target.value])}>
              <option value="">-- Select --</option>
              ${savedTeams.map((team, i) => html`<option value=${i}>${team.name}</option>`)}
            </select>
            <input class="form-control form-control-lg text-center"
              placeholder="Room Code (optional)"
              value=${roomId}
              onInput=${e => setRoomId(e.target.value)} />
          </div>
          <div class="d-grid">
            <button class="btn btn-success btn-lg" onClick=${joinRoom}>Join / Create Room</button>
          </div>
        `}
        ${status === "connecting" && html`
          <p class="text-muted mt-4">Connecting to server...</p>
        `}
        ${status === "waiting" && html`
          <p class="mt-4">Room Code:</p>
          <h3 class="fw-bold">${roomId}</h3>
          <p class="text-muted">Waiting for second player...</p>
        `}
        <div class="d-grid">
          <button type="button" class="btn btn-danger btn-lg" onClick=${exit}>Back</button>
        </div>
      </div>
    `}

    ${status === "gameOver" && html`<${GameOver} gameResult=${gameResult} btnClick=${() => setStatus("idle")} btnText="Back to Levels" />`}
  </div>
  `;
}

export default Online;
