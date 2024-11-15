import { html, useState } from "https://esm.sh/htm/preact/standalone";

const ActionTracker = ({ tileSize, gameState }) => {
  const { turnCount, currentTurn, duelState, isSwapPhase } = gameState;
  const actionsRemaining = duelState.map(ds => ds.actionsRemaining);

  const turnIconWidth = tileSize / 2;
  const diamondWidth = tileSize / 4;

  const middleDiamondX = tileSize - diamondWidth / 2;
  const middleDiamondY = diamondWidth / 3;
  const offsetFromMiddle = diamondWidth * 0.63;

  const activeDiamondWidth = diamondWidth * 1.75;
  const activeDiamondOffset = -diamondWidth * 3 / 8;

  return html`
  <img src="assets/maps/common/SummonerDuels_Corner1.webp" style="width:100%" alt="corner 2" />
  <img src="assets/maps/common/blueTurn.webp" style=${{
      display: `${!isSwapPhase && currentTurn === 0 ? "block" : "none"}`,
      width: `${turnIconWidth}px`,
      top: `${tileSize - (turnIconWidth / 2)}px`,
      left: `${tileSize / 8}px`
    }} alt="turn" />
  <img src="assets/maps/common/redTurn.webp" style=${{
      display: `${!isSwapPhase && currentTurn === 1 ? "block" : "none"}`,
      width: `${turnIconWidth}px`,
      top: `${tileSize - (turnIconWidth / 2)}px`,
      left: `${tileSize * 11 / 8}px`
    }} alt="turn" />
  ${Array(actionsRemaining[0]).fill().map((_, i) => {
      return html`<img src="assets/maps/common/blueDiamond.webp" style=${{
        width: `${diamondWidth}px`,
        top: `${2 * tileSize - middleDiamondY - diamondWidth - (i % 2) * offsetFromMiddle}px`,
        left: `${middleDiamondX + (i - 2) * offsetFromMiddle}px`
      }} />`
    })}
  ${Array(actionsRemaining[1]).fill().map((_, i) => {
      return html`<img src="assets/maps/common/redDiamond.webp" style=${{
        width: `${diamondWidth}px`,
        top: `${middleDiamondY + (i % 2) * offsetFromMiddle}px`,
        left: `${middleDiamondX - (i - 2) * offsetFromMiddle}px`
      }} />`
    })}
    <img src="assets/maps/common/blueDiamondActive.webp" style=${{
      display: `${!isSwapPhase && currentTurn === 0 ? "block" : "none"}`,
      width: `${activeDiamondWidth}px`,
      top: `${2 * tileSize - middleDiamondY - diamondWidth - ((actionsRemaining[0] - 1) % 2) * offsetFromMiddle + activeDiamondOffset}px`,
      left: `${middleDiamondX + (actionsRemaining[0] - 3) * offsetFromMiddle + activeDiamondOffset}px`
    }} />
  <img src="assets/maps/common/redDiamondActive.webp" style=${{
      display: `${!isSwapPhase && currentTurn === 1 ? "block" : "none"}`,
      width: `${activeDiamondWidth}px`,
      top: `${middleDiamondY + ((actionsRemaining[1] - 1) % 2) * offsetFromMiddle + activeDiamondOffset}px`,
      left: `${middleDiamondX - (actionsRemaining[1] - 3) * offsetFromMiddle + activeDiamondOffset}px`
    }} />
  <span style=${{
      width: "100%",
      top: `${tileSize / 2}px`,
      textAlign: "center",
      fontSize: `${tileSize * 3 / 5}px`
    }}>${turnCount}</span>
  <span style=${{
      width: "100%",
      top: `${tileSize * 1.15}px`,
      textAlign: "center",
      fontSize: `${tileSize / 3}px`
    }}>5</span>
  `;
}

export default ActionTracker;
