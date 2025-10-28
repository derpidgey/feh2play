import { html } from "https://esm.sh/htm/preact/standalone";
import UnitInfo from "./UnitInfo.js";
import useGameFont from "../hooks/useGameFont.js";

const SidePanel = ({ team, backgroundType, playingAs }) => {
  const gameFont = useGameFont();

  return html`
  <div class="side-panel" style=${{ ...gameFont }}>
    ${team.map(unit => html`<${UnitInfo} unit=${unit} backgroundType=${backgroundType} playingAs=${playingAs} />`)}
  </div>
  `;
}

export default SidePanel;
