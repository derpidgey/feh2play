import { html, useState } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import Dropdown from "./Dropdown.js";
import { SKILL_TYPE } from "../data/definitions.js";
import Engine from "../engine.js";

const skillConfig = [
  {
    skillType: SKILL_TYPE.WEAPON,
    icon: "assets/icons/Icon_Skill_Weapon.webp"
  },
  {
    skillType: SKILL_TYPE.ASSIST,
    icon: "assets/icons/Icon_Skill_Assist.webp"
  },
  {
    skillType: SKILL_TYPE.SPECIAL,
    icon: "assets/icons/Icon_Skill_Special.webp"
  },
  {
    skillType: SKILL_TYPE.A,
    icon: "assets/icons/A.webp"
  },
  {
    skillType: SKILL_TYPE.B,
    icon: "assets/icons/B.webp"
  },
  {
    skillType: SKILL_TYPE.C,
    icon: "assets/icons/C.webp"
  },
  {
    skillType: SKILL_TYPE.S,
    icon: "assets/icons/S.webp"
  }
]

const engine = Engine();

const TeamEditor = ({ teamData, onChange, onCancel, onSave }) => {
  const [editingIndex, setEditingIndex] = useState(0);

  const maxUnits = teamData.mode === "sd" ? 5 : 4;
  const team = [...teamData.units];
  const currentUnit = team[editingIndex];
  const currentUnitInfo = currentUnit.unitId ? UNIT[currentUnit.unitId] : null;

  while (team.length < maxUnits) team.push({ unitId: "", skills: Array(8).fill("") });

  return html`
    <div class="screen" style="padding: 16px;">
      <h2>${teamData.name} (${teamData.mode})</h2>
      <div style="display: flex; margin-bottom: 16px;">
        ${team.map((unit, idx) => {
    const isActive = editingIndex === idx;
    return html`
            <div
              style="
                cursor: pointer;
                padding: 4px 8px;
                margin-right: 4px;
                border: 2px solid ${isActive ? "#007bff" : "#ccc"};
                border-radius: 4px;
                background-color: ${isActive ? "#e6f0ff" : "#f9f9f9"};
                display: flex;
                align-items: center;
                justify-content: center;
                width: 60px;
                height: 60px;
              "
              onClick=${() => setEditingIndex(idx)}>
              ${unit.unitId
        ? html`<img src=${UNIT[unit.unitId].imgFace} alt=${UNIT[unit.unitId].name} style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />`
        : html`<span>${idx + 1}</span>`}
            </div>
          `;
  })}
      </div>

      <div style="margin-bottom: 16px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <div class="input-row">
          <${Dropdown}
          options=${["-", ...Object.values(UNIT).map(u => `${u.name}: ${u.subtitle}`)]}
          onSelect=${value => {
      const newTeam = [...team];
      const newId = Object.values(UNIT).find(u => value.includes(u.name) && value.includes(u.subtitle))?.id ?? "";
      newTeam[editingIndex].unitId = newId;
      onChange(newTeam);
    }}
          defaultSelected=${currentUnit.unitId ? `${currentUnitInfo.name}: ${currentUnitInfo.subtitle}` : "-"}/>
        </div>

        ${Array.from(skillConfig).map((config, i) => {
      const currentSkill = currentUnit.skills[i] || "";
      return html`
          <div class="input-row" style="gap: 10px;">
            <img src=${config.icon} style="height: 1.8rem;" />
            <${Dropdown}
            options=${["-", ...Object.values(SKILLS).filter(skill => skill.type === config.skillType && !skill.id.includes("_REFINE_"))
          .filter(skill => currentUnit.unitId ? engine.canLearn(currentUnitInfo, skill) : false)
          .map(skill => skill.name)]}
            onSelect=${value => {
          const newTeam = [...team];
          const newId = Object.values(SKILLS).find(s => value === s.name)?.id ?? "";
          newTeam[editingIndex].skills[i] = newId;
          onChange(newTeam);
        }}
            defaultSelected=${currentSkill === "" ? "-" : Object.values(SKILLS).find(s => currentSkill === s.id).name}/>
          </div>
          `
    })}
      </div>

      <div>
        <button onClick=${onCancel}>Cancel</button>
        <button onClick=${onSave}>Save</button>
      </div>
    </div>
  `;
}

export default TeamEditor;
