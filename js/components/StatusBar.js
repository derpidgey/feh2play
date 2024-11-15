import { html, useState } from "https://esm.sh/htm/preact/standalone";

const StatusBar = ({ turn, currentTurn, playingAs }) => {


  return html`
  <div class="status-bar">
    <span>Turn ${turn}</span>
    <br/>
    <span>${currentTurn === playingAs ? "PLAYER" : "ENEMY"} PHASE</span>
  </div>
  `;
}

export default StatusBar;
