import { html, useState } from "https://esm.sh/htm/preact/standalone";
import TeamEditor from "./TeamEditor.js";

const LOCAL_STORAGE_KEY = "teams";

const TeamBuilder = ({ onExit }) => {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMode, setNewTeamMode] = useState("standard");

  const saveTeams = (updatedTeams) => {
    setTeams(updatedTeams);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTeams));
  };

  const createTeam = () => {
    if (!newTeamName) return;
    const updated = [...teams, { name: newTeamName, mode: newTeamMode, units: [] }];
    saveTeams(updated);
    setNewTeamName("");
  };

  if (editingTeamIndex !== null) {
    const teamData = teams[editingTeamIndex];
    const handleTeamChange = newUnits => {
      const newTeams = [...teams];
      newTeams[editingTeamIndex] = { ...teamData, units: newUnits };
      saveTeams(newTeams);
    };
    return html`<${TeamEditor}
      teamData=${teamData}
      onChange=${handleTeamChange}
      onCancel=${() => setEditingTeamIndex(null)}
      onSave=${() => setEditingTeamIndex(null)} 
    />`;
  }


  return html`
    <div class="screen">
      <h2>Team Builder</h2>
      <div>
        <input
          type="text"
          placeholder="Team name"
          value=${newTeamName}
          onInput=${e => setNewTeamName(e.target.value)}
        />
        <select value=${newTeamMode} onChange=${e => setNewTeamMode(e.target.value)}>
          <option value="standard">Standard</option>
          <option value="sd">SD</option>
        </select>
        <button onClick=${createTeam}>Create Team</button>
      </div>

      <h3>Existing Teams</h3>
      <div>
        ${teams.map((team, i) => html`
          <div>
            ${team.name} (${team.mode})
            <button onClick=${() => setEditingTeamIndex(i)}>Edit</button>
            <button onClick=${() => saveTeams(teams.filter((_, idx) => idx !== i))}>Delete</button>
          </div>
        `)}
      </div>

      <button onClick=${onExit}>Back</button>
    </div>
  `;
}

export default TeamBuilder;
