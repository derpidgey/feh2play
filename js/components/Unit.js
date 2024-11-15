import { html, useState, useEffect } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import { WEAPON_TYPE } from "../data/definitions.js";
import STATUS from "../data/status.js";

const Unit = ({ unit, isCaptain, isActive, tileSize, potentialAction, showActionIndicator }) => {
  const [statusIndex, setStatusIndex] = useState(0);

  const totalStatuses = [...unit.bonuses, ...unit.penalties];
  if (Object.values(unit.buffs).some(buff => buff > 0)) totalStatuses.push("buff");
  if (Object.values(unit.debuffs).some(debuff => debuff > 0)) totalStatuses.push("debuff");

  useEffect(() => {
    if (totalStatuses.length === 0) return;
    setStatusIndex(0);
    const interval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % totalStatuses.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalStatuses.length]);

  const getStatusImage = status => {
    if (status === "buff") {
      return "assets/status/Status_Effect_Bonus.webp";
    }
    if (status === "debuff") {
      return "assets/status/Status_Effect_Penalty.webp";
    }
    return STATUS[status]?.img;
  }

  const unitInfo = UNIT[unit.unitId];
  const weaponInfo = WEAPON_TYPE[unitInfo.weaponType];
  const specialCharge = unit.special.current;
  const temporaryPosition = potentialAction.to;
  const position = isActive && temporaryPosition ? temporaryPosition : unit.pos;

  const weaponIconPosition = unit.team === 0
    ? { top: "0", left: "0" }
    : { top: "0", right: "0" };

  const captainIconPosition = unit.team === 0
    ? { top: "0", right: "0" }
    : { top: "0", left: "0" };

  const specialChargePosition = unit.team === 0
    ? { top: `${tileSize * 0.3}px`, left: "0" }
    : { top: `${tileSize * 0.3}px`, right: "0" };

  const hpPercentage = (unit.stats.hp / unit.stats.maxHp) * 100;
  const hpBarWidth = `${hpPercentage}%`;
  const hpColour = unit.team === 0 ? "deepskyblue" : "red";
  const indicatorWidth = tileSize / 4;
  const indicatorBorderStyle = "3px solid aliceblue";
  const fontSize = `${tileSize / 4}px`;
  const greyscaleStyle = unit.hasAction ? {} : { filter: "grayscale(1)" };

  return html`
  <div
    class="unit-container"
    style=${{
      left: `${position.x * tileSize}px`,
      top: `${position.y * tileSize}px`,
      width: `${tileSize}px`,
      height: `${tileSize}px`
    }}>
  ${showActionIndicator && html`
    <div class="action-indicator" style=${{
        position: "absolute",
        width: `${indicatorWidth}px`,
        height: `${indicatorWidth}px`,
        borderTop: indicatorBorderStyle,
        borderLeft: indicatorBorderStyle,
        top: 1,
        left: 1
      }} />
    <div class="action-indicator" style=${{
        position: "absolute",
        width: `${indicatorWidth}px`,
        height: `${indicatorWidth}px`,
        borderTop: indicatorBorderStyle,
        borderRight: indicatorBorderStyle,
        top: 1,
        right: 1
      }} />
    <div class="action-indicator" style=${{
        position: "absolute",
        width: `${indicatorWidth}px`,
        height: `${indicatorWidth}px`,
        borderBottom: indicatorBorderStyle,
        borderLeft: indicatorBorderStyle,
        bottom: 1,
        left: 1
      }} />
    <div class="action-indicator" style=${{
        width: `${indicatorWidth}px`,
        height: `${indicatorWidth}px`,
        borderBottom: indicatorBorderStyle,
        borderRight: indicatorBorderStyle,
        bottom: 1,
        right: 1
      }} />
  `}
    <img src=${unitInfo.imgSprite} alt=${unitInfo.name} style=${{
      display: "block",
      margin: "auto",
      height: "100%",
      transform: unit.team === 0 ? "none" : "scaleX(-1)",
      ...greyscaleStyle
    }} />
    <img src=${weaponInfo.img} alt=${weaponInfo.name} style=${{
      position: "absolute",
      width: `${tileSize / 3}px`,
      height: `${tileSize / 3}px`,
      ...weaponIconPosition
    }} />
    ${isCaptain && html`
      <img src="assets/maps/common/crown.webp" alt=${weaponInfo.name} style=${{
        position: "absolute",
        width: `${tileSize / 3}px`,
        height: `${tileSize / 3}px`,
        ...captainIconPosition
      }} />`}
    ${specialCharge != null && html`
      <span style=${{
        position: "absolute",
        color: "DarkMagenta",
        fontSize,
        fontWeight: "bold",
        backgroundColor: "grey",
        ...specialChargePosition
      }}>${specialCharge}</span>`}
    ${totalStatuses.length > 0 && statusIndex < totalStatuses.length && html`
      <img src=${getStatusImage(totalStatuses[statusIndex])} style=${{
        position: "absolute",
        width: `${tileSize / 3}px`,
        top: `${tileSize * 0.6}px`,
        right: 0
      }} />`}
    <div class="unit-hp">
      <span style=${{ color: hpColour, fontSize, backgroundColor: "darkslategrey" }}>${unit.stats.hp}</span>
      <div class="hp-bar">
        <div class="hp-fill" style=${{ width: hpBarWidth, backgroundColor: hpColour }} />
      </div>
    </div>
  </div>`;
};

export default Unit;
