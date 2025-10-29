import { html, useState } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import Engine from "../engine.js";
import MAPS from "../data/maps.js";
import TeamBuilder from "./TeamBuilder.js";
import SDAssault from "./SDAssault.js";
import GameOver from "./GameOver.js";
import { DEMO_TEAMS } from "../config.js";

const engine = Engine();

const App = () => {
  const [screen, setScreen] = useState("menu");
  const [playingAs, setPlayingAs] = useState(0);
  const [gameResult, setGameResult] = useState("suck");

  const gameState = engine.newGame(MAPS.SD15, DEMO_TEAMS[0], DEMO_TEAMS[1], "duel");

  const onGameOver = (result, delay = 1000) => {
    setTimeout(() => {
      setScreen("gameOver");
      setGameResult(result);
    }, delay);
  }

  return html`
    <div class="app-container">
      ${screen === "menu" && html`
        <div class="screen">
          <div class="p-3 text-center">
            <h1>feh2play</h1>
            <div class="d-grid gap-3">
              <button type="button" class="btn btn-secondary btn-lg" onClick=${() => setScreen("demo")}>SD Demo</button>
              <button type="button" class="btn btn-info btn-lg" onClick=${() => setScreen("teamBuilder")}>Team Builder</button>
              <button type="button" class="btn btn-primary btn-lg" onClick=${() => setScreen("sdAssault")}>SD Assault</button>
            </div>
          </div>
        </div>
      `}

      ${screen === "demo" && html`
        <div class="screen">
          <div class="p-3 text-center">
            <h2>Summoner Duels Demo</h2>
            <div class="btn-group btn-group-lg w-100 mb-5">
              <button type="button" class="btn btn-outline-info w-50${playingAs === 0 ? " active" : ""}" onClick=${() => setPlayingAs(0)}>Team 1</button>
              <button type="button" class="btn btn-outline-danger w-50${playingAs === 1 ? " active" : ""}" onClick=${() => setPlayingAs(1)}>Team 2</button>
            </div>
            <div class="d-grid gap-3">
              <button type="button" class="btn btn-success btn-lg" onClick=${() => setScreen("game")}>Fight!</button>
              <button type="button" class="btn btn-danger btn-lg" onClick=${() => setScreen("menu")}>Back</button>
            </div>
          </div>
        </div>
      `}

      ${screen === "game" && html`
        <${Game} 
          initialGameState=${gameState} 
          playingAs=${playingAs} 
          onGameOver=${onGameOver} 
        />
      `}

      ${screen === "gameOver" && html`<${GameOver} gameResult=${gameResult} btnClick=${() => setScreen("menu")} btnText="Main Menu" />`}

      ${screen === "teamBuilder" && html`
        <${TeamBuilder} onExit=${() => setScreen("menu")} />
      `}

      ${screen === "sdAssault" && html`
        <${SDAssault} onExit=${() => setScreen("menu")} />
      `}
    </div>
  `;
}

export default App;
