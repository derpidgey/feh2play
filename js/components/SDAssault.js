import { html, useState } from "https://esm.sh/htm/preact/standalone";
import Game from "./Game.js";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import Engine from "../engine.js";
import MAPS from "../data/maps.js";
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

const cavs = [
  createBuild(UNIT.CECILIA.id, [SKILLS.TURMOIL.id, SKILLS.TOME_OF_ORDER.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.GUARD_3.id, SKILLS.GOAD_CAVALRY.id, SKILLS.DRIVE_ATK_2.id + "_SEAL"]),
  createBuild(UNIT.ELIWOOD.id, [SKILLS.BLAZING_DURANDAL.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.GALEFORCE.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.DRAG_BACK.id, SKILLS.ATK_SMOKE_3.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
  createBuild(UNIT.ABEL.id, [SKILLS.PANTHER_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DEATH_BLOW_3.id, SKILLS.DRAG_BACK.id, SKILLS.ATK_SMOKE_3.id, SKILLS.DEATH_BLOW_3.id + "_SEAL"]),
  createBuild(UNIT.ELISE.id, [SKILLS.ELISES_STAFF.id + "_REFINE_EFF", SKILLS.PHYSIC_PLUS.id, SKILLS.MIRACLE.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"]),
  createBuild(UNIT.GUNTER.id, [SKILLS.INVETERATE_AXE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.BONFIRE.id, SKILLS.FURY_3.id, SKILLS.DRAG_BACK.id, SKILLS.GOAD_CAVALRY.id, SKILLS.DRIVE_SPD_2.id + "_SEAL"])
];
const fliers = [
  createBuild(UNIT.CATRIA.id, [SKILLS.EARTH_RENDERING.id, SKILLS.WHITEWING_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.HARDY_BEARING_3.id]),
  createBuild(UNIT.OLIVIA.id, [SKILLS.SLAYING_EDGE_PLUS.id + "_REFINE_DEF", SKILLS.DANCE.id, SKILLS.MOONBOW.id, SKILLS.FURY_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.DRIVE_SPD_2.id, SKILLS.DRIVE_SPD_2.id + "_SEAL"]),
  createBuild(UNIT.EST.id, [SKILLS.WHITEWING_SPEAR.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.LUNA.id, SKILLS.ATK_DEF_BOND_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.ATK_DEF_BOND_3.id + "_SEAL"]),
  createBuild(UNIT.CAMILLA.id, [SKILLS.CAMILLAS_AXE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.LUNA.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
  createBuild(UNIT.PALLA.id, [SKILLS.WHITEWING_BLADE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.FURY_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"])
];

const armours = [
  createBuild(UNIT.AZAMA.id, [SKILLS.EARTH_RENDERING.id, SKILLS.PAIN_PLUS.id + "_REFINE_WRATHFUL", SKILLS.MARTYR_PLUS.id, SKILLS.MIRACLE.id, SKILLS.FORTRESS_DEF_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.SAVAGE_BLOW_3.id + "_SEAL"]),
  createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.CLOSE_DEF_3.id, SKILLS.GUARD_3.id, SKILLS.PANIC_PLOY_3.id, SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]),
  createBuild(UNIT.GWENDOLYN.id, [SKILLS.WEIGHTED_LANCE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.BONFIRE.id, SKILLS.DISTANT_COUNTER.id, SKILLS.QUICK_RIPOSTE_3.id, SKILLS.WARD_ARMOUR.id, SKILLS.STEADY_BREATH.id + "_SEAL"]),
  createBuild(UNIT.DRAUG.id, [SKILLS.STALWART_SWORD.id + "_REFINE_EFF", SKILLS.SMITE.id, SKILLS.MOONBOW.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.ARMOUR_MARCH.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"]),
  createBuild(UNIT.EFFIE.id, [SKILLS.EFFIES_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DISTANT_COUNTER.id, SKILLS.VANTAGE_3.id, SKILLS.WARD_ARMOUR.id, SKILLS.DEATH_BLOW_3.id + "_SEAL"])
];

const SD_LEVELS = [
  {
    id: "sd_fliers",
    name: "Sky Attack",
    description: "Engage in a battle for air superiority",
    battles: [
      { map: MAPS.SD15, enemyTeam: fliers }
    ]
  },
  {
    id: "sd_armour",
    name: "Iron Wall",
    description: "Break through the phalanx.",
    battles: [
      { map: MAPS.SD7, enemyTeam: armours }
    ]
  },
  {
    id: "sd_cavs",
    name: "Cavalry Training",
    description: "Endure their relentless advance.",
    battles: [
      { map: MAPS.SD9, enemyTeam: cavs }
    ]
  },
  {
    id: "sd_emblem_gauntlet",
    name: "Trial of Emblems",
    description: "Face of against the triple threat.",
    battles: [
      { map: MAPS.SD15, enemyTeam: fliers },
      { map: MAPS.SD7, enemyTeam: armours },
      { map: MAPS.SD9, enemyTeam: cavs },
    ]
  },
];


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

  const level = selectedLevel ? SD_LEVELS.find(l => l.id === selectedLevel) : null;

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
    return engine.newGame(
      level.battles[battleIndex].map,
      selectedTeam.units.map(unit => ({
        ...unit,
        skills: unit.skills.filter(skill => skill !== "")
      })),
      level.battles[battleIndex].enemyTeam,
      "duel"
    )
  }

  if (screen === "battle" && level) {
    return html`
    <${Game}
      key=${battleIndex} 
      initialGameState=${createInitialGameState}
      playingAs=${0}
      onGameOver=${handleBattleEnd}
    />`;
  }

  return html`
    <div class="screen">
      ${screen === "levelSelect" && html`
        <div class="p-3 text-center d-flex flex-column" style="height: 100%;">
          <h2 class="mb-4">SD Assault</h2>
          <div class="d-grid gap-3 overflow-auto mb-4">
            ${SD_LEVELS.map(l => html`
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
