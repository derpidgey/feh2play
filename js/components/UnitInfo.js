import { html } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import STATUS from "../data/status.js";
import { SKILL_TYPE } from "../data/definitions.js";
import Engine from "../engine.js";
import useBootstrapTooltips from "../hooks/useBootstrapTooltips.js";

const engine = Engine();

const UnitInfo = ({ unit, backgroundType, playingAs }) => {
  useBootstrapTooltips();
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

  const weaponInfo = engine.getWeaponInfo(unit);
  const assistInfo = engine.getAssistInfo(unit);
  const specialInfo = engine.getSpecialInfo(unit);
  const aInfo = engine.getSkillInfo(unit, SKILL_TYPE.A);
  const bInfo = engine.getSkillInfo(unit, SKILL_TYPE.B);
  const cInfo = engine.getSkillInfo(unit, SKILL_TYPE.C);
  const sInfo = engine.getSkillInfo(unit, SKILL_TYPE.S);

  const weaponTooltipContent = weaponInfo ?
    `<span class="tooltip-gold">Mt</span> ${weaponInfo.might} <span class="tooltip-gold">Rng</span> ${weaponInfo.range}<br>
  ${weaponInfo.description}${weaponInfo.refineDescription && `<br><span class="tooltip-green">${weaponInfo.refineDescription}</span>`}` : "None";
  const assistTooltipContent = assistInfo ?
    `<span class="tooltip-gold">Rng</span> ${assistInfo.range}<br>
  ${assistInfo.description}` : "None";
  const specialTooltipContent = specialInfo ?
    `<img src="assets/icons/Icon_Skill_Special.webp" class="tooltip-img" /> ${specialInfo.cooldown}<br>
  ${specialInfo.description}` : "None";
  const getPassiveTooltipContent = skillInfo => skillInfo ?
    `<span class="tooltip-gold">${skillInfo.name}</span><br>
  ${skillInfo.description}` : "None";

  return html`
  <div class="info-panel" style="background: ${background}; color: black;">
    <div style="flex: 1 1 20%; display: flex; align-items: center; justify-content: center;">
      <img src=${unitInfo.imgFace} alt=${unitInfo.name} style="width: 100%; max-width: 80px; object-fit: contain;" />
    </div>
    <div style="flex: 1 1 40%; display: flex; flex-direction: column;">
      <span class="fw-medium">${unitInfo.name}</span>
      <span>HP: ${unit.stats.hp} / ${unit.stats.maxHp}</span>
      <span>
        ATK: <span style=${getStatStyle(visibleAtk, unit.stats.atk)}>${visibleAtk}</span> SPD: <span style=${getStatStyle(visibleSpd, unit.stats.spd)}>${visibleSpd}</span>
      </span>
      <span>
        DEF: <span style=${getStatStyle(visibleDef, unit.stats.def)}>${visibleDef}</span> RES: <span style=${getStatStyle(visibleRes, unit.stats.res)}>${visibleRes}</span>
      </span>
    </div>
    <div class="skills" style="flex: 1 1 40%; display: flex; flex-direction: column;">
      <div class="skill-icons">
        ${[aInfo, bInfo, cInfo, sInfo].map((skillInfo, i) => skillInfo ? html`
          <img src=${skillInfo.img}
          style="z-index: ${6 - i};"
          data-bs-toggle="tooltip"
          data-bs-html="true"
          data-bs-placement="bottom"
          data-bs-title=${getPassiveTooltipContent(skillInfo)} />` : html`<div class="no-skill"></div>
        `)}
      </div>
      <div style="display: flex; flex-direction: column;">
        <div class="skill-line" data-bs-toggle="tooltip" data-bs-html="true" data-bs-placement="bottom" data-bs-title=${weaponTooltipContent}>
          <img src=${weaponInfo?.img ?? "assets/icons/Icon_Skill_Weapon.webp"} />
          <span style="color: ${weaponInfo?.refined ? "lime" : "white"};">${weaponInfo?.name ?? "-"}</span>
        </div>
        <div class="skill-line" data-bs-toggle="tooltip" data-bs-html="true" data-bs-placement="bottom" data-bs-title=${assistTooltipContent}>
          <img src="assets/icons/Icon_Skill_Assist.webp" />
          <span>${assistInfo?.name ?? "-"}</span>
        </div>
        <div class="skill-line" data-bs-toggle="tooltip" data-bs-html="true" data-bs-placement="bottom" data-bs-title=${specialTooltipContent}>
          <img src="assets/icons/Icon_Skill_Special.webp" />
          <span>${specialInfo?.name ?? "-"}</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

export default UnitInfo;
