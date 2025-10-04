import { useState } from "https://esm.sh/htm/preact/standalone";
import { deepClone } from "../utils.js";

export function useTeamDraft(teams, setTeams) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(null);

  const startEditing = (index) => {
    setEditingIndex(index);
    setDraft(deepClone(teams[index]));
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (editingIndex === null || !draft) return;
    const updated = [...teams];
    updated[editingIndex] = deepClone(draft);
    setTeams(updated);
    cancelEditing();
  };

  return {
    editingIndex,
    draft,
    setDraft,
    startEditing,
    cancelEditing,
    saveDraft,
  };
}
