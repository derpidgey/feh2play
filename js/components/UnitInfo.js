import { html } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import STATUS from "../data/status.js";

const UnitInfo = ({ unit, backgroundType, playingAs }) => {
  const unitInfo = UNIT[unit.unitId];
  const isPanicked = unit.penalties.includes(STATUS.PANIC.id);
  const visibleAtk = unit.stats.atk + (isPanicked ? -unit.buffs.atk : unit.buffs.atk) - unit.debuffs.atk;
  const visibleSpd = unit.stats.spd + (isPanicked ? -unit.buffs.spd : unit.buffs.spd) - unit.debuffs.spd;
  const visibleDef = unit.stats.def + (isPanicked ? -unit.buffs.def : unit.buffs.def) - unit.debuffs.def;
  const visibleRes = unit.stats.res + (isPanicked ? -unit.buffs.res : unit.buffs.res) - unit.debuffs.res;

  const getStatStyle = (visible, base) => {
    if (visible > base) return { color: "dodgerblue" }; // deepskyblue/dodgerblue
    if (visible < base) return { color: "red" };
    return { color: "black" }; // gold?
  };

  let background;
  if (backgroundType === "relative") {
    background = unit.team === playingAs ? "mediumturquoise" : "darkred";
  } else {
    background = unit.team === 0 ? "mediumturquoise" : "darkred";
  }

  return html`
  <div class="info-panel" style="background: ${background};">
    <div style="flex: 1 1 20%; display: flex; align-items: center; justify-content: center;">
      <img src=${unitInfo.imgFace} alt=${unitInfo.name} style="width: 100%; max-width: 80px; object-fit: contain;" />
    </div>
    <div style="flex: 1 1 40%; display: flex; flex-direction: column;">
      <h2>${unitInfo.name}</h2>
      <p>HP: ${unit.stats.hp} / ${unit.stats.maxHp}</p>
      <p>
        ATK: <span style=${getStatStyle(visibleAtk, unit.stats.atk)}>${visibleAtk}</span> SPD: <span style=${getStatStyle(visibleSpd, unit.stats.spd)}>${visibleSpd}</span>
      </p>
      <p>
        DEF: <span style=${getStatStyle(visibleDef, unit.stats.def)}>${visibleDef}</span> RES: <span style=${getStatStyle(visibleRes, unit.stats.res)}>${visibleRes}</span>
      </p>
    </div>
    <div style="flex: 1 1 40%; display: flex; flex-direction: column;">
      ${unit.skills.map(skill => html`<p>${SKILLS[skill].name}</p>`)}
    </div>
  </div>
  `;
}

export default UnitInfo;
