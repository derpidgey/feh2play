import { html, useState } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import Engine from "../engine.js";
import GameOver from "./GameOver.js";
import { SD_ASSAULT_LEVELS } from "../config.js";

const engine = Engine();

const SDAssault = ({ onExit }) => {
  const [screen, setScreen] = useState("levelSelect");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [battleIndex, setBattleIndex] = useState(0);
  const [gameResult, setGameResult] = useState("suck");

  const savedTeams = JSON.parse(localStorage.getItem("teams") || "[]")
    .filter(team => team.mode === "sd");

  const startLevel = () => {
    if (!selectedTeam) return alert("Please select a team first!");
    setBattleIndex(0);
    setScreen("battle");
  };

  const level = selectedLevel ? SD_ASSAULT_LEVELS.find(l => l.id === selectedLevel) : null;

  const handleBattleEnd = (result, delay = 1000) => {
    const isLastBattle = battleIndex >= level.battles.length - 1;
    if (result === "lose" || isLastBattle) {
      setTimeout(() => {
        setScreen("gameOver");
        setGameResult(result);
      }, delay);
    } else {
      setBattleIndex(battleIndex + 1);
    }
  };

  const createInitialGameState = () => {
    const battle = level.battles[battleIndex];
    const playerTeam = selectedTeam.units.map(unit => ({
      ...unit,
      skills: unit.skills.filter(skill => skill !== "")
    }));
    const enemyTeam = battle.team;
    return engine.newGame(
      battle.map,
      battle.side === "red" ? playerTeam : enemyTeam,
      battle.side === "red" ? enemyTeam : playerTeam,
      "duel"
    )
  }

  if (screen === "battle" && level) {
    return html`
    <${Game}
      initialGameState=${createInitialGameState}
      playingAs=${level.battles[battleIndex].side === "red" ? 0 : 1}
      onGameOver=${handleBattleEnd}
    />`;
  }

  return html`
    <div class="screen">
      ${screen === "levelSelect" && html`
        <div class="p-3 text-center d-flex flex-column" style="height: 100%;">
          <h2 class="mb-4">SD Assault</h2>
          <div class="d-grid gap-3 overflow-auto mb-4">
            ${SD_ASSAULT_LEVELS.map(l => html`
              <div class="card shadow-sm border-0" role="button" onClick=${() => { setSelectedLevel(l.id); setScreen("preview"); }}>
                <div class="card-body">
                  <h5 class="card-title mb-1">${l.name}</h5>
                  <p class="card-text text-muted small mb-0">${l.description}</p>
                </div>
              </div>
            `)}
          </div>
          <div class="d-grid mt-auto">
            <button type="button" class="btn btn-danger btn-lg" onClick=${onExit}>Back</button>
          </div>
        </div>
      `}

      ${screen === "preview" && level && html`
        <div class="p-3 text-center">
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-body">
              <h3 class="card-title mb-2">${level.name}</h3>
              <p class="card-text text-muted mb-3">${level.description}</p>
              <p class="fw-semibold">Maps in this challenge: ${level.battles.length}</p>
            </div>
          </div>

          <div class="mb-4">
            <label for="teamSelect" class="form-label fw-semibold">Select Your Team:</label>
            <select 
              id="teamSelect" 
              class="form-select form-select-lg text-center"
              onChange=${e => setSelectedTeam(savedTeams[e.target.value])}>
              <option value="">-- Select --</option>
              ${savedTeams.map((team, i) => html`<option value=${i}>${team.name}</option>`)}
            </select>
          </div>

          <div class="d-grid gap-3">
            <button type="button" class="btn btn-success btn-lg" onClick=${startLevel}>Fight!</button>
            <button type="button" class="btn btn-danger btn-lg" onClick=${() => setScreen("levelSelect")}>Back</button>
          </div>
        </div>
      `}

      ${screen === "gameOver" && html`<${GameOver} gameResult=${gameResult} btnClick=${() => setScreen("levelSelect")} btnText="Back to Levels" />`}
    </div>
  `;
}

export default SDAssault;
