import { html, useState } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import Engine from "../engine.js";
import MAPS from "../data/maps.js";

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

  const team1 = [
    createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.DISTANT_COUNTER.id, SKILLS.GUARD_3.id, SKILLS.PANIC_PLOY_3.id, SKILLS.QUICK_RIPOSTE_3.id]),
    createBuild(UNIT.ELIWOOD.id, [SKILLS.DURANDAL.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.GALEFORCE.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.GUARD_3.id, SKILLS.ATK_SMOKE_3.id, SKILLS.SWIFT_SPARROW_2.id]),
    createBuild(UNIT.ABEL.id, [SKILLS.BRAVE_LANCE_PLUS.id, SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DEATH_BLOW_3.id, SKILLS.HIT_AND_RUN.id, SKILLS.ATK_SMOKE_3.id, SKILLS.DEATH_BLOW_3.id]),
    createBuild(UNIT.CLARINE.id, [SKILLS.GRAVITY_PLUS.id + "_REFINE_WRATHFUL", SKILLS.PHYSIC_PLUS.id, SKILLS.MIRACLE.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.ATK_SPD_BOND_3.id]),
    createBuild(UNIT.CAEDA.id, [SKILLS.WING_SWORD.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.ICEBERG.id, SKILLS.FURY_3.id, SKILLS.HIT_AND_RUN.id, SKILLS.DRIVE_ATK_3.id, SKILLS.DRIVE_SPD_3.id])
  ];
  const team2 = [
    createBuild(UNIT.CATRIA.id, [SKILLS.WHITEWING_LANCE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.DRIVE_ATK_3.id]),
    createBuild(UNIT.OLIVIA.id, [SKILLS.SLAYING_EDGE_PLUS.id + "_REFINE_DEF", SKILLS.DANCE.id, SKILLS.MOONBOW.id, SKILLS.FURY_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.DRIVE_DEF_3.id, SKILLS.DRIVE_RES_3.id]),
    createBuild(UNIT.EST.id, [SKILLS.WHITEWING_SPEAR.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.HONE_FLIERS.id]),
    createBuild(UNIT.CAMILLA.id, [SKILLS.CAMILLAS_AXE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.SWIFT_SPARROW_2.id]),
    createBuild(UNIT.PALLA.id, [SKILLS.WHITEWING_BLADE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.FURY_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.FORTIFY_FLIERS.id])
  ];
  const gameState = engine.newGame(MAPS.SD15, team1, team2, "duel");

  return html`
  <div class="app-container">
    ${screen === "menu" && html`
      <div>
        <h1>Demo</h1>
        <span>(No captain skills)</span><br/>
        <span>Playing as: Team ${playingAs + 1}</span><br/>
        <button onClick=${() => setPlayingAs(0)}>Team 1</button><br/>
        <button onClick=${() => setPlayingAs(1)}>Team 2</button><br/>
        <button onClick=${() => setScreen("game")}>Play</button>
      </div>
      `}
    ${screen === "game" && html`<${Game} initialGameState=${gameState} playingAs=${playingAs} />`}
  </div>
  `;
}

export default App;
