import { html, useState } from "https://esm.sh/htm/preact/standalone";

const ActionPanel = ({ gameState, onEndTurn, setShowDangerArea, onEndSwapPhase, playingAs }) => {

  return html`
  <div class="action-panel">
    <button onClick=${() => setShowDangerArea(prev => !prev)}>Danger Area</button>
    ${!gameState.isSwapPhase && gameState.currentTurn === playingAs && html`<button onClick=${onEndTurn}>End Turn</button>`}
    ${gameState.isSwapPhase && html`<button onClick=${onEndSwapPhase}>Fight!</button>`}
  </div>
  `;
}

export default ActionPanel;
