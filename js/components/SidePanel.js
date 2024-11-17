import { html, useState } from "https://esm.sh/htm/preact/standalone";
import UnitInfo from "./UnitInfo.js";

const SidePanel = ({ team, backgroundType, playingAs }) => {


  return html`
  <div class="side-panel">
    ${team.map(unit => html`<${UnitInfo} unit=${unit} backgroundType=${backgroundType} playingAs=${playingAs} />`)}
  </div>
  `;
}

export default SidePanel;
