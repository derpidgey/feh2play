import { html, useState } from "https://esm.sh/htm/preact/standalone";

const Timer = ({ tileSize, currentTurn, playingAs }) => {
  const time = 69;
  const extra = 69;

  const line1 = tileSize / 6;
  const line2 = line1 + tileSize / 6;
  const line3 = line2 + tileSize;

  
  // - 30s per move
  // - If you make your move before the 30s run out, you get up to 7s of extra time
  // - formula is t_plus = (t_remaining - 1) / 4 (rounded down, can't be negative)
  // - Extra time can stack up to a maximum of 60s and is conserved between turns. It will only be used if the regular timer for a move runs out.
  // - if reaches 0, auto battle
  return html`
  <img src="assets/maps/common/SummonerDuels_Corner2.webp" style="width:100%" alt="corner 2" />
  <span style=${{
    width: "100%",
    top: `${line1}px`,
    textAlign: "center",
    fontSize: `${tileSize / 3}px`
  }}>Time:</span>
  <span style=${{
    width: "100%",
    top: `${line2}px`,
    textAlign: "center",
    fontSize: `${tileSize}px`
  }}>${time}</span>
  <span style=${{
    width: "100%",
    top: `${line3}px`,
    textAlign: "center",
    fontSize: `${tileSize / 3}px`
  }}>plus ${extra}</span>
  `;
}

export default Timer;
