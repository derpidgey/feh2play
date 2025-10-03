import { html, useState } from "https://esm.sh/htm/preact/standalone";

const SDAssault = ({ onExit }) => {
  return html`
    <div class="screen menu">
      <div>
        <h2>Team Builder (WIP)</h2>
        <button onClick=${onExit}>Back</button>
      </div>
    </div>
  `;
}

export default SDAssault;
