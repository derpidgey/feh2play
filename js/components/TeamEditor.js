import { html, useState } from "https://esm.sh/htm/preact/standalone";
import UNIT from "../data/units.js";
import SKILLS from "../data/skills.js";
import Dropdown from "./Dropdown.js";
import { SKILL_TYPE } from "../data/definitions.js";
import Engine from "../engine.js";
import { deepClone } from "../utils.js";
import WeaponSelector from "./WeaponSelector.js";

const skillConfig = [
  {},
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

  const team = [...teamData.units];
  const currentUnit = team[editingIndex];
  const currentUnitInfo = currentUnit?.unitId ? UNIT[currentUnit.unitId] : null;

  const removeInvalidSkills = unit => {
    unit.skills = unit.skills.map(skill => engine.canLearn(UNIT[unit.unitId], SKILLS[skill]) ? skill : "");
    return unit;
  }

  const updateUnit = unitId => {
    const newTeamData = deepClone(teamData);
    newTeamData.units[editingIndex].unitId = unitId;
    removeInvalidSkills(newTeamData.units[editingIndex]);
    onChange(newTeamData);
  }

  const updateSkill = (skillIndex, skillId) => {
    const newTeamData = deepClone(teamData);
    const targetIndex = skillIndex === 7 && teamData.mode === "sd" ? 0 : editingIndex;
    newTeamData.units[targetIndex].skills[skillIndex] = skillId;
    removeInvalidSkills(newTeamData.units[targetIndex]);
    onChange(newTeamData);
  }

  const validateAndSave = () => {
    const result = engine.validateTeam(team.filter(unit => unit.unitId !== ""), teamData.mode);
    if (result.result) {
      onSave();
    } else {
      console.log(result.reason);
    }
  }

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
      <div class="input-row" style="gap: 10px;">
        <div style="width: 1.8rem;"></div>
        <${Dropdown}
        options=${[{ label: "-", value: "" }, ...Object.values(UNIT).map(u => ({ label: `${u.name}: ${u.subtitle}`, value: u.id }))]}
        onSelect=${updateUnit}
        defaultSelected=${currentUnit?.unitId ? `${currentUnitInfo.name}: ${currentUnitInfo.subtitle}` : "-"}/>
      </div>

      ${skillConfig.map((config, i) => {
    const currentSkill = currentUnit?.skills[i] || "";
    if (i === 0) {
      return html`<${WeaponSelector}
      weaponId=${currentSkill}
      unitInfo=${currentUnitInfo}
      onChange=${skillId => updateSkill(0, skillId)} />`;
    }

    return html`
        <div class="input-row" style="gap: 10px;">
          <img src=${config.icon} style="height: 1.8rem;" />
          <${Dropdown}
          options=${[{ label: "-", value: "" }, ...Object.values(SKILLS).filter(skill => skill.type === config.skillType)
        .filter(skill => currentUnit?.unitId ? engine.canLearn(currentUnitInfo, skill) : false)
        .map(skill => ({ label: skill.name, value: skill.id }))]}
          onSelect=${skillId => updateSkill(i, skillId)}
          defaultSelected=${currentSkill === "" ? "-" : Object.values(SKILLS).find(s => currentSkill === s.id).name}/>
        </div>
        `
  })}
    </div>

    ${teamData.mode === "sd" && html`
      <div style="margin-bottom: 16px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <div class="input-row" style="gap: 10px;">
          <${Dropdown}
            options=${[
        { label: "-", value: "" },
        ...Object.values(SKILLS)
          .filter(skill => skill.type === SKILL_TYPE.CAPTAIN)
          .map(skill => ({ label: skill.name, value: skill.id })),
      ]}
            onSelect=${skillId => updateSkill(7, skillId)}
            defaultSelected=${team[0]?.skills?.[7] ? SKILLS[team[0].skills[7]].name : "-"}/>
        </div>
      </div>
    `}


    <div>
      <button onClick=${onCancel}>Cancel</button>
      <button onClick=${validateAndSave}>Save</button>
    </div>
  </div>
  `;
}

export default TeamEditor;
