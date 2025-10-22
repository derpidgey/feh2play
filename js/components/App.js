import { html, useState } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import Engine from "../engine.js";
import MAPS from "../data/maps.js";
import TeamBuilder from "./TeamBuilder.js";
import SDAssault from "./SDAssault.js";
import GameOver from "./GameOver.js";

function createBuild(unitId, skills = []) {
  return {
    unitId,
    level: 40,
    merges: 0,
    skills
  }
}
const engine = Engine();

const App = () => {
  const [screen, setScreen] = useState("menu");
  const [playingAs, setPlayingAs] = useState(0);
  const [gameResult, setGameResult] = useState("suck");

  const team1 = [
    createBuild(UNIT.SAIZO.id, [SKILLS.MIGHT_OF_MIRIADS.id, SKILLS.SAIZOS_STAR.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.GLIMMER.id, SKILLS.FURY_3.id, SKILLS.VANTAGE_3.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.FURY_3.id + "_SEAL"]),
    createBuild(UNIT.ELIWOOD.id, [SKILLS.DURANDAL.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.ESCUTCHEON.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.GUARD_3.id, SKILLS.ATK_SMOKE_3.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
    createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.GLIMMER.id, SKILLS.CLOSE_DEF_3.id, SKILLS.GUARD_3.id, SKILLS.INFANTRY_PULSE_3.id, SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]),
    createBuild(UNIT.ELISE.id, [SKILLS.ELISES_STAFF.id + "_REFINE_EFF", SKILLS.RECOVER_PLUS.id, SKILLS.MIRACLE.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.SAVAGE_BLOW_3.id + "_SEAL"]),
    createBuild(UNIT.CAEDA.id, [SKILLS.WING_SWORD.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.ICEBERG.id, SKILLS.FURY_3.id, SKILLS.DRAG_BACK.id, SKILLS.GUIDANCE_3.id, SKILLS.DRIVE_ATK_2.id + "_SEAL"])
  ];
  const team2 = [
    createBuild(UNIT.CATRIA.id, [SKILLS.EARTH_RENDERING.id, SKILLS.WHITEWING_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.HARDY_BEARING_3.id]),
    createBuild(UNIT.OLIVIA.id, [SKILLS.SLAYING_EDGE_PLUS.id + "_REFINE_DEF", SKILLS.DANCE.id, SKILLS.MOONBOW.id, SKILLS.FURY_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.DRIVE_SPD_2.id, SKILLS.DRIVE_SPD_2.id + "_SEAL"]),
    createBuild(UNIT.EST.id, [SKILLS.WHITEWING_SPEAR.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.LUNA.id, SKILLS.ATK_DEF_BOND_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.ATK_DEF_BOND_3.id + "_SEAL"]),
    createBuild(UNIT.CAMILLA.id, [SKILLS.CAMILLAS_AXE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.LUNA.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
    createBuild(UNIT.PALLA.id, [SKILLS.WHITEWING_BLADE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.FURY_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"])
  ];
  const gameState = engine.newGame(MAPS.SD15, team1, team2, "duel");

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
