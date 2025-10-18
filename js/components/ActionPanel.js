import { html } from "https://esm.sh/htm/preact/standalone";

const ActionPanel = ({ gameState, onEndTurn, setShowDangerArea, onEndSwapPhase, playingAs, surrender }) => {

  return html`
  <div class="action-panel d-flex justify-content-start gap-2 p-2">
    <div class="d-flex gap-2">
      <button class="btn btn-danger" onClick=${() => setShowDangerArea(prev => !prev)}>Danger<br/>Area</button>
      ${!gameState.isSwapPhase && gameState.currentTurn === playingAs && html`
        <button class="btn btn-primary" onClick=${onEndTurn}>End<br/>Turn</button>`}
      ${gameState.isSwapPhase && html`<button class="btn btn-success" onClick=${onEndSwapPhase}>Fight!</button>`}
    </div>
    <button class="btn btn-warning ms-auto" onClick=${surrender}>Surrender</button>
  </div>
  `;
}

export default ActionPanel;
