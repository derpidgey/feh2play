import { html, useState, useRef } from "https://esm.sh/htm/preact/standalone";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [editingIndex, setEditingIndex] = useState(0);
  const dragIndexRef = useRef(null);

  const handleDragStart = (e, index) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newTeamData = deepClone(teamData);
    const temp = newTeamData.units[dragIndex];
    newTeamData.units[dragIndex] = newTeamData.units[dropIndex];
    newTeamData.units[dropIndex] = temp;

    if (teamData.mode === "sd") {
      const capSkill = teamData.units[0].skills[7];
      newTeamData.units.forEach(u => (u.skills[7] = ""));
      newTeamData.units[0].skills[7] = capSkill;
    }

    onChange(newTeamData);
    setEditingIndex(dropIndex);
    dragIndexRef.current = null;
  };

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

  const showErrorPopup = message => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  }

  const validateAndSave = () => {
    const result = engine.validateTeam(team.filter(unit => unit.unitId !== ""), teamData.mode);
    if (result.result) {
      onSave();
    } else {
      showErrorPopup(result.reason);
    }
  }

  const updateMode = e => {
    const mode = e.target.value;
    const newTeamData = deepClone(teamData);

    if (mode === "sd" && teamData.mode !== "sd") {
      // Going from standard -> SD (add 5th unit)
      newTeamData.units.push({
        unitId: "",
        level: 40,
        merges: 0,
        skills: Array(8).fill("")
      });
    } else if (mode !== "sd" && teamData.mode === "sd") {
      // Going from SD -> standard (remove 5th unit)
      newTeamData.units = newTeamData.units.slice(0, 4);
    }

    newTeamData.mode = mode;
    onChange(newTeamData);
  };

  return html`
  <div class="screen">
    ${showError && html`
    <div class="position-fixed top-0 start-50 translate-middle-x mt-2 alert alert-danger alert-dismissible">
      <div>${errorMessage}</div>
      <button type="button" class="btn-close" onClick=${() => setShowError(false)}></button>
    </div>
    `}
    <div class="p-3">
      <div class="row g-3 align-items-center mb-4">
        <div class="col-md-9">
          <input type="text" class="form-control" placeholder="Team name"
          value=${teamData.name} onInput=${e => onChange({ ...teamData, name: e.target.value })} />
        </div>
        <div class="col-md-3">
          <select class="form-select" value=${teamData.mode} onChange=${updateMode}>
            <option value="standard">Standard</option>
            <option value="sd">SD</option>
          </select>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mb-4">
        ${team.map((unit, i) => {
    const isActive = editingIndex === i;
    return html`
        <div
          class="d-flex align-items-center justify-content-center border rounded"
          draggable="true"
          onDragStart=${e => handleDragStart(e, i)}
          onDragOver=${handleDragOver}
          onDrop=${e => handleDrop(e, i)}
          style=${{
        cursor: "grab",
        width: "60px",
        height: "60px",
        borderColor: isActive ? "#007bff" : "#ccc",
        backgroundColor: isActive ? "#e6f0ff" : "#f9f9f9",
      }} onClick=${() => setEditingIndex(i)}>
          ${unit.unitId
        ? html`<img src=${UNIT[unit.unitId].imgFace} alt=${UNIT[unit.unitId].name} class="img-fluid rounded" style="width: 50px; height: 50px; object-fit: cover;" />`
        : html`<span>${i + 1}</span>`}
        </div>`;
  })}
      </div>

      <div class="card p-3 mb-4">
        <div class="input-row">
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
        <div class="input-row">
          <img src=${config.icon} style="height: 1.8rem;" />
          <${Dropdown}
          options=${[{ label: "-", value: "" }, ...Object.values(SKILLS).filter(skill => skill.type === config.skillType)
        .filter(skill => currentUnit?.unitId ? engine.canLearn(currentUnitInfo, skill) : false)
        .map(skill => ({ label: skill.name, value: skill.id }))]}
          onSelect=${skillId => updateSkill(i, skillId)}
          defaultSelected=${currentSkill === "" ? "-" : Object.values(SKILLS).find(s => currentSkill === s.id).name}/>
        </div>`})}
      </div>

      ${teamData.mode === "sd" && html`
      <div class="card p-3 mb-4">
        <div class="input-row">
          <div style="width: 1.8rem;"></div>
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
      </div>`}

      <div class="d-flex gap-2">
        <button type="button" class="btn btn-secondary flex-fill" onClick=${onCancel}>Cancel</button>
        <button type="button" class="btn btn-primary flex-fill" onClick=${validateAndSave}>Save</button>
      </div>
    </div>
  </div>
  `;
}

export default TeamEditor;
