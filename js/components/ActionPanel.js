import { html } from "https://esm.sh/htm/preact/standalone";
import useGameFont from "../hooks/useGameFont.js";

const ActionPanel = ({ gameState, onEndTurn, setShowDangerArea, onEndSwapPhase, playingAs, surrender }) => {
  const gameFont = useGameFont();

  return html`
  <div class="action-panel d-flex justify-content-start gap-2 p-2">
    <div class="d-flex gap-2">
      <button class="btn btn-danger d-flex flex-column justify-content-center" onClick=${() => setShowDangerArea(prev => !prev)} style=${{ ...gameFont }}>Danger<br/>Area</button>
      ${!gameState.isSwapPhase && gameState.currentTurn === playingAs && html`
        <button class="btn btn-primary d-flex flex-column justify-content-center" onClick=${onEndTurn} style=${{ ...gameFont }}>End<br/>Turn</button>`}
      ${gameState.isSwapPhase && html`<button class="btn btn-success d-flex flex-column justify-content-center" onClick=${onEndSwapPhase} style=${{ ...gameFont }}>Fight!</button>`}
    </div>
    <button class="btn btn-warning ms-auto d-flex flex-column justify-content-center" onClick=${surrender} style=${{ ...gameFont }}>Surrender</button>
  </div>
  `;
}

export default ActionPanel;
