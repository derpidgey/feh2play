import { html } from "https://esm.sh/htm/preact/standalone";
import WEAPON_SKILLS from "../data/weapons.js";
import Engine from "../engine.js";
import Dropdown from "./Dropdown.js";

const engine = Engine();

const refineLabels = {
  ATK: "Atk",
  SPD: "Spd",
  DEF: "Def",
  RES: "Res",
  EFF: "Effect",
  WRATHFUL: "Wrathful",
  DAZZLE: "Dazzling"
}

const WeaponSelector = ({ weaponId, onChange, unitInfo }) => {
  const [basePart, refinePart] = weaponId?.includes("_REFINE_")
    ? weaponId.split("_REFINE_")
    : [weaponId, ""];
  const baseLabel = WEAPON_SKILLS[weaponId]?.name;

  const weaponOptions = [{ label: "-", value: "" }, ...Object.values(WEAPON_SKILLS)
    .filter(skill => !skill.id.includes("_REFINE_"))
    .filter(skill => unitInfo ? engine.canLearn(unitInfo, skill) : false)
    .map(skill => ({ label: skill.name, value: skill.id }))
  ];

  const refineOptions = WEAPON_SKILLS[basePart]?.canBeRefined ? [{ label: "-", value: "" }, ...Object.values(WEAPON_SKILLS)
    .filter(skill => skill.id.includes("_REFINE_") && skill.id.startsWith(basePart))
    .map(skill => ({ label: refineLabels[skill.id.split("_REFINE_")[1]], value: skill.id.split("_REFINE_")[1] }))
  ] : [];

  const handleWeaponChange = newWeaponId => {
    const matchingRefine = Object.values(WEAPON_SKILLS)
      .find(skill => skill.id === `${newWeaponId}_REFINE_${refinePart}`);
    onChange(matchingRefine ? `${newWeaponId}_REFINE_${refinePart}` : newWeaponId);
  };

  const handleRefineChange = newRefineId => {
    onChange(newRefineId ? `${basePart}_REFINE_${newRefineId}` : basePart);
  };

  return html`
    <div class="input-row" style="gap: 10px;">
      <img src="assets/icons/Icon_Skill_Weapon.webp" style="height: 1.8rem;" />
      <${Dropdown}
        options=${weaponOptions}
        onSelect=${handleWeaponChange}
        defaultSelected=${baseLabel || "-"} />
    </div>
    <div class="input-row" style="gap: 10px;">
      <img src="assets/icons/Refine.webp" style="height: 1.8rem;" />
      <${Dropdown}
        options=${refineOptions}
        onSelect=${handleRefineChange}
        defaultSelected=${refineLabels[refinePart] || "-"} />
    </div>
  `;
}

export default WeaponSelector;
