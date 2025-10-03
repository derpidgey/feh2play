import { html, useState } from "https://esm.sh/htm/preact/standalone";

const TeamBuilder = ({ onExit }) => {
  return html`
    <div class="screen">
      <h2>Team Builder (WIP)</h2>
      <button onClick=${onExit}>Back</button>
    </div>
  `;
}

export default TeamBuilder;
