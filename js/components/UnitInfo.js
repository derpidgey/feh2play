import { html } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import STATUS from "../data/status.js";
import { SKILL_TYPE, WEAPON_TYPE } from "../data/definitions.js";
import Engine from "../engine.js";

const engine = Engine();

const getSkillInfo = (unit, skillType) => SKILLS[unit.skills.find(skill => SKILLS[skill].type === skillType)];
const getWeaponInfo = unit => getSkillInfo(unit, SKILL_TYPE.WEAPON);
const getAssistInfo = unit => getSkillInfo(unit, SKILL_TYPE.ASSIST);
const getSpecialInfo = unit => getSkillInfo(unit, SKILL_TYPE.SPECIAL);
const getWeaponType = unit => WEAPON_TYPE[UNIT[unit.unitId].weaponType];

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

  const weaponInfo = getWeaponInfo(unit);
  const assistInfo = getAssistInfo(unit);
  const specialInfo = getSpecialInfo(unit);
  const aInfo = getSkillInfo(unit, SKILL_TYPE.A);
  const bInfo = getSkillInfo(unit, SKILL_TYPE.B);
  const cInfo = getSkillInfo(unit, SKILL_TYPE.C);
  const sInfo = getSkillInfo(unit, SKILL_TYPE.S);

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
    <div class="skills" style="flex: 1 1 40%; display: flex; flex-direction: column;">
      <div class="skill-icons">
        ${aInfo ? html`<img src=${aInfo.img} style="z-index: 5;" />` : html`<div class="no-skill"></div>`}
        ${bInfo ? html`<img src=${bInfo.img} style="z-index: 4;" />` : html`<div class="no-skill"></div>`}
        ${cInfo ? html`<img src=${cInfo.img} style="z-index: 3;" />` : html`<div class="no-skill"></div>`}
        ${sInfo ? html`<img src=${sInfo.img} style="z-index: 2;" />` : html`<div class="no-skill"></div>`}
      </div>
      <div style="display: flex; flex-direction: column;">
        <div class="skill-line">
          <img src=${weaponInfo.img ?? "assets/icons/Icon_Skill_Weapon.webp"} />
          <span style="font-size:1rem;color: ${weaponInfo.refined ? "lime" : "white"};">${weaponInfo.name ?? "-"}</span>
        </div>
        <div class="skill-line">
          <img src="assets/icons/Icon_Skill_Assist.webp" />
          <span style="font-size:1rem">${assistInfo.name ?? "-"}</span>
        </div>
        <div class="skill-line">
          <img src="assets/icons/Icon_Skill_Special.webp" />
          <span style="font-size:1rem">${specialInfo.name ?? "-"}</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

export default UnitInfo;
