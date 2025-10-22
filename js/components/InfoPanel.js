import { html } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import { COMBAT_FLAG } from "../data/definitions.js";
import Engine from "../engine.js";
import UnitInfo from "./UnitInfo.js";
import { deepClone } from "../utils.js";

const engine = Engine();

const InfoPanel = ({ gameState, unit, potentialAction, playingAs }) => {
  if (potentialAction.target) {
    return html`<${ActionPreview} gameState=${gameState} potentialAction=${potentialAction} />`;
  }
  if (unit) {
    const backgroundType = gameState.mode === "duel" ? "absolute" : "relative";
    return html`<${UnitInfo} unit=${unit} backgroundType=${backgroundType} playingAs=${playingAs} />`
  }
  return html`<div class="info-panel"></div>`;
}

const ActionPreview = ({ gameState, potentialAction }) => {
  const unit = [...gameState.teams[0], ...gameState.teams[1]]
    .find(unit => unit.pos.x === potentialAction.from.x && unit.pos.y === potentialAction.from.y);
  const unitInfo = UNIT[unit.unitId];
  const targetUnit = [...gameState.teams[0], ...gameState.teams[1]]
    .find(unit => unit.pos.x === potentialAction.target.x && unit.pos.y === potentialAction.target.y)
  const targetBlock = gameState.map.blocks
    .find(b => b.x === potentialAction.target.x && b.y === potentialAction.target.y);
  const actionType = targetUnit ? (unit.team === targetUnit.team ? "assist" : "attack") : "block";
  const backgroundType = gameState.mode === "duel" ? "absolute" : "relative";
  const backgrounds = ["mediumturquoise", "darkred"];
  let leftBackground;
  let rightBackground;
  if (backgroundType === "relative") {
    leftBackground = 0;
    rightBackground = actionType === "assist" ? 0 : 1;
  } else {
    leftBackground = unit.team === 0 ? 0 : 1;
    rightBackground = actionType === "assist" ? leftBackground : leftBackground ^ 1;
  }

  const targetName = targetUnit ? UNIT[targetUnit.unitId].name : "Obstacle";

  let unitStartingHp = unit.stats.hp;
  let unitRemainingHp = unit.stats.hp;
  let targetStartingHp = targetUnit ? targetUnit.stats.hp : targetBlock.hp;
  let targetRemainingHp = targetUnit ? targetUnit.stats.hp : targetBlock.hp - 1;
  let assist;
  let result;
  let formulas;
  if (actionType === "assist") {
    assist = engine.getAssistInfo(unit).name;
    const clone = deepClone(gameState);
    const cloneUnit = clone.teams[unit.team].find(u => u.id === unit.id);
    cloneUnit.pos = { ...potentialAction.to }
    const cloneTarget = clone.teams[targetUnit.team].find(u => u.id === targetUnit.id);
    engine.performAssist(clone, cloneUnit, cloneTarget);
    unitRemainingHp = cloneUnit.stats.hp;
    targetRemainingHp = cloneTarget.stats.hp;
  } else if (actionType === "attack") {
    const unitPos = unit.pos;
    unit.pos = { ...potentialAction.to }
    result = engine.calculateCombatResult(gameState, unit, targetUnit);
    unit.pos = unitPos;
    unitRemainingHp = result.units[0].stats.hp;
    targetRemainingHp = result.units[1].stats.hp;
    formulas = [0, 1].map(i => {
      const { canAttack, baseDamage, constantFixedDamage, staffMod, canDouble } = result.units[i];
      const attacksTwice = result.units[i].flags[COMBAT_FLAG.ATTACKS_TWICE];
      if (!canAttack) return "-";
      let hits = 1;
      if (canDouble) hits *= 2;
      if (attacksTwice) hits *= 2;
      return `${Math.floor((baseDamage + Math.floor(constantFixedDamage)) * staffMod)}${hits > 1 ? `x${hits}` : ""}`;
    });
    if (result.sequence[0].aoe) {
      formulas[0] = `${result.sequence[0].damage}+` + formulas[0];
    }
  }

  const renderTempStats = stats => {
    return Object.entries(stats)
      .filter(([_, value]) => value !== 0)
      .map(([stat, value]) => {
        const color = value > 0 ? 'blue' : 'red';
        const sign = value > 0 ? '+' : '';
        return html`${stat.charAt(0).toUpperCase() + stat.slice(1)} <span style="color: ${color}; margin-right: 4px; ">${sign}${value}</span>`;
      });
  };

  return html`<div class="info-panel">
    <div style="flex: 1 1 20%; display: flex; align-items: center; justify-content: center; background: ${backgrounds[leftBackground]};">
      <img src=${unitInfo.imgFace} alt=${unitInfo.name} style="width: 100%; max-width: 80px; object-fit: contain;" />
    </div>
    <div style="flex: 1 1 30%; display: flex; align-items: center; flex-direction: column; background: ${backgrounds[leftBackground]};">
      <span class="fw-medium">${unitInfo.name}</span>
      <span>${unitStartingHp} → ${unitRemainingHp}</span>
      ${actionType === "assist" && html`<span>${assist}</span>`}
      ${actionType === "attack" && html`<span>${formulas[0]}</span>`}
      ${actionType === "attack" && html`<span>${renderTempStats(result.units[0].tempStats)}</span>`}
    </div>
    <div style="flex: 1 1 30%; display: flex; align-items: center; flex-direction: column; background: ${backgrounds[rightBackground]};">
      <span class="fw-medium">${targetName}</span>
      <span>${targetStartingHp} → ${targetRemainingHp}</span>
      ${actionType === "attack" && html`<span>${formulas[1]}</span>`}
      ${actionType === "attack" && html`<span>${renderTempStats(result.units[1].tempStats)}</span>`}
    </div>
    <div style="flex: 1 1 20%; display: flex; align-items: center; justify-content: center; background: ${backgrounds[rightBackground]};">
      ${targetUnit
      ? html`<img src=${UNIT[targetUnit.unitId].imgFace} alt=${UNIT[targetUnit.unitId].name} style="width: 100%; max-width: 80px; object-fit: contain;" />`
      : html`<div style="width: 100%; max-width: 80px;" />`}
    </div>
  </div>`;
}

export default InfoPanel;
