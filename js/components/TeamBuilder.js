import { html, useState } from "https://esm.sh/htm/preact/standalone";
import TeamEditor from "./TeamEditor.js";
import { useTeamDraft } from "../hooks/useTeamDraft.js";

const LOCAL_STORAGE_KEY = "teams";

const TeamBuilder = ({ onExit }) => {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const saveTeams = (updatedTeams) => {
    setTeams(updatedTeams);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTeams));
  };

  const {
    editingIndex,
    draft,
    setDraft,
    startEditing,
    cancelEditing,
    saveDraft,
  } = useTeamDraft(teams, saveTeams);

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMode, setNewTeamMode] = useState("sd");

  const createTeam = () => {
    if (!newTeamName) return;
    const maxUnits = newTeamMode === "sd" ? 5 : 4;
    const team = { name: newTeamName, mode: newTeamMode, units: [] };
    while (team.units.length < maxUnits) team.units.push({ unitId: "", level: 40, merges: 0, skills: Array(8).fill("") });
    const updated = [...teams, team];
    saveTeams(updated);
    setNewTeamName("");
  };

  const copyTeam = team => {
    const newTeam = { ...team, name: "Copy of " + team.name };
    saveTeams([newTeam, ...teams]);
  }

  if (editingIndex !== null && draft) {
    return html`<${TeamEditor}
      teamData=${draft}
      onChange=${setDraft}
      onCancel=${cancelEditing}
      onSave=${saveDraft}
    />`;
  }

  return html`
    <div class="screen">
      <div class="p-3">
        <h2 class="text-center mb-4">Team Builder</h2>
        <div class="row g-3 align-items-center mb-4">
          <div class="col-md-5">
            <input type="text" class="form-control" placeholder="Team name" 
            value=${newTeamName} onInput=${e => setNewTeamName(e.target.value)}/>
          </div>
          <div class="col-md-3">
            <select class="form-select" value=${newTeamMode} onChange=${e => setNewTeamMode(e.target.value)}>
              <option value="standard">Standard</option>
              <option value="sd">SD</option>
            </select>
          </div>
          <div class="col-md-4 text-end">
            <button type="button" class="btn btn-success" onClick=${createTeam}>Create Team</button>
          </div>
        </div>

        <h3>Teams</h3>
        <div class="list-group mb-4">
          ${teams.map((team, i) => html`
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>${team.name}</strong> <small class="text-muted">(${team.mode})</small>
              </div>
              <div class="btn-group">
                <button type="button" class="btn btn-outline-primary btn-sm" onClick=${() => startEditing(i)}>Edit</button>
                <button type="button" class="btn btn-outline-success btn-sm" onClick=${() => copyTeam(team)}>Copy</button>
                <button type="button" class="btn btn-outline-danger btn-sm" onClick=${() => saveTeams(teams.filter((_, idx) => idx !== i))}>Delete</button>
              </div>
            </div>
          `)}
        </div>

        <div class="d-grid">
          <button type="button" class="btn btn-danger btn-lg" onClick=${onExit}>Back</button>
        </div>
      </div>
    </div>
  `;
}

export default TeamBuilder;
