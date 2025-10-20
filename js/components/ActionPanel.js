import { html, useState } from "https://esm.sh/htm/preact/standalone";
import useResizeListener from "../hooks/useResizeListener.js";

const ActionPanel = ({ gameState, onEndTurn, setShowDangerArea, onEndSwapPhase, playingAs, surrender }) => {
  const [fontSize, setFontSize] = useState("16px");

  useResizeListener(() => {
    setFontSize(`${Math.min(window.innerWidth, window.innerHeight / 2) * 0.04}px`);
  }, 10);

  return html`
  <div class="action-panel d-flex justify-content-start gap-2 p-2">
    <div class="d-flex gap-2">
      <button class="btn btn-danger d-flex flex-column justify-content-center" onClick=${() => setShowDangerArea(prev => !prev)} style="font-size: clamp(0.5rem, ${fontSize}, 1rem);">Danger<br/>Area</button>
      ${!gameState.isSwapPhase && gameState.currentTurn === playingAs && html`
        <button class="btn btn-primary d-flex flex-column justify-content-center" onClick=${onEndTurn} style="font-size: clamp(0.5rem, ${fontSize}, 1rem);">End<br/>Turn</button>`}
      ${gameState.isSwapPhase && html`<button class="btn btn-success d-flex flex-column justify-content-center" onClick=${onEndSwapPhase} style="font-size: clamp(0.5rem, ${fontSize}, 1rem);">Fight!</button>`}
    </div>
    <button class="btn btn-warning ms-auto d-flex flex-column justify-content-center" onClick=${surrender} style="font-size: clamp(0.5rem, ${fontSize}, 1rem);">Surrender</button>
  </div>
  `;
}

export default ActionPanel;
