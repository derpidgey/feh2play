import { html, useState } from "https://esm.sh/htm/preact/standalone";
import UnitInfo from "./UnitInfo.js";
import useResizeListener from "../hooks/useResizeListener.js";

const SidePanel = ({ team, backgroundType, playingAs }) => {
  const [fontSize, setFontSize] = useState("16px");

  useResizeListener(() => {
    setFontSize(`${Math.min(window.innerWidth, window.innerHeight / 2) * 0.04}px`);
  }, 10);

  return html`
  <div class="side-panel" style="font-size: clamp(0.5rem, ${fontSize}, 1rem);">
    ${team.map(unit => html`<${UnitInfo} unit=${unit} backgroundType=${backgroundType} playingAs=${playingAs} />`)}
  </div>
  `;
}

export default SidePanel;
