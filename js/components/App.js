import { html, useState } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import Engine from "../engine.js";
import MAPS from "../data/maps.js";
import TeamBuilder from "./TeamBuilder.js";
import SDAssault from "./SDAssault.js";

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
    createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.CLOSE_DEF_3.id, SKILLS.GUARD_3.id, SKILLS.PANIC_PLOY_3.id, SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]),
    createBuild(UNIT.ELIWOOD.id, [SKILLS.DURANDAL.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.GALEFORCE.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.GUARD_3.id, SKILLS.ATK_SMOKE_3.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
    createBuild(UNIT.ABEL.id, [SKILLS.PANTHER_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DEATH_BLOW_3.id, SKILLS.HIT_AND_RUN.id, SKILLS.ATK_SMOKE_3.id, SKILLS.DEATH_BLOW_3.id + "_SEAL"]),
    createBuild(UNIT.CLARINE.id, [SKILLS.GRAVITY_PLUS.id + "_REFINE_WRATHFUL", SKILLS.PHYSIC_PLUS.id, SKILLS.MIRACLE.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"]),
    createBuild(UNIT.CAEDA.id, [SKILLS.WING_SWORD.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.ICEBERG.id, SKILLS.FURY_3.id, SKILLS.HIT_AND_RUN.id, SKILLS.DRIVE_ATK_2.id, SKILLS.DRIVE_SPD_2.id + "_SEAL"])
  ];
  const team2 = [
    createBuild(UNIT.CATRIA.id, [SKILLS.WHITEWING_LANCE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.DRIVE_ATK_2.id + "_SEAL"]),
    createBuild(UNIT.OLIVIA.id, [SKILLS.SLAYING_EDGE_PLUS.id + "_REFINE_DEF", SKILLS.DANCE.id, SKILLS.MOONBOW.id, SKILLS.FURY_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.DRIVE_DEF_2.id, SKILLS.DRIVE_RES_2.id + "_SEAL"]),
    createBuild(UNIT.EST.id, [SKILLS.WHITEWING_SPEAR.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.ATK_DEF_BOND_3.id + "_SEAL"]),
    createBuild(UNIT.CAMILLA.id, [SKILLS.CAMILLAS_AXE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
    createBuild(UNIT.PALLA.id, [SKILLS.WHITEWING_BLADE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.FURY_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"])
  ];

  const team3 = [
    createBuild(UNIT.AZAMA.id, [SKILLS.PAIN_PLUS.id + "_REFINE_WRATHFUL", SKILLS.MARTYR_PLUS.id, SKILLS.MIRACLE.id, SKILLS.FORTRESS_DEF_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.SAVAGE_BLOW_3.id + "_SEAL"]),
    createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.CLOSE_DEF_3.id, SKILLS.GUARD_3.id, SKILLS.PANIC_PLOY_3.id, SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]),
    createBuild(UNIT.GWENDOLYN.id, [SKILLS.WEIGHTED_LANCE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.BONFIRE.id, SKILLS.DISTANT_COUNTER.id, SKILLS.QUICK_RIPOSTE_3.id, SKILLS.WARD_ARMOUR.id, SKILLS.STEADY_BREATH.id + "_SEAL"]),
    createBuild(UNIT.DRAUG.id, [SKILLS.STALWART_SWORD.id + "_REFINE_EFF", SKILLS.SMITE.id, SKILLS.MOONBOW.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.ARMOUR_MARCH.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"]),
    createBuild(UNIT.EFFIE.id, [SKILLS.EFFIES_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DISTANT_COUNTER.id, SKILLS.VANTAGE_3.id, SKILLS.WARD_ARMOUR.id, SKILLS.DEATH_BLOW_3.id + "_SEAL"])
  ];
  const gameState = engine.newGame(MAPS.SD15, team1, team3, "duel");

  const onGameOver = result => {
    setTimeout(() => {
      setScreen("gameOver");
      setGameResult(result);
    }, 1000);
  }

  return html`
    <div class="app-container">
      ${screen === "menu" && html`
        <div class="screen menu">
          <div>
            <h1>feh2play</h1>
            <button onClick=${() => setScreen("demo")}>Summoner Duels (Demo)</button><br/>
            <button onClick=${() => setScreen("teamBuilder")}>Team Builder</button><br/>
            <button onClick=${() => setScreen("sdAssault")}>SD Assault</button><br/>
          </div>
        </div>
      `}

      ${screen === "demo" && html`
        <div class="screen menu">
          <div>
            <h2>Summoner Duels Demo</h2>
            <span>(No captain skills)</span><br/>
            <span>Playing as: Team ${playingAs + 1}</span><br/>
            <button onClick=${() => setPlayingAs(0)}>Team 1</button><br/>
            <button onClick=${() => setPlayingAs(1)}>Team 2</button><br/>
            <button onClick=${() => setScreen("game")}>Play</button><br/>
            <button onClick=${() => setScreen("menu")}>Back</button>
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

      ${screen === "gameOver" && html`
        <div class="screen menu">
          <div>
            <h2>Game Over</h2>
            <div>${gameResult}</div>
            <button onClick=${() => setScreen("menu")}>Main Menu</button>
          </div>
        </div>
      `}

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
