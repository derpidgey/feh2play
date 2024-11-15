import { html, useState } from "https://esm.sh/htm/preact/standalone";

const ActionPanel = ({ gameState, endTurn, setShowDangerArea, endSwapPhase, playingAs }) => {

  return html`
  <div class="action-panel">
    <button onClick=${() => setShowDangerArea(prev => !prev)}>Danger Area</button>
    ${!gameState.isSwapPhase && gameState.currentTurn === playingAs && html`<button onClick=${endTurn}>End Turn</button>`}
    ${gameState.isSwapPhase && html`<button onClick=${endSwapPhase}>Fight!</button>`}
  </div>
  `;
}

export default ActionPanel;
