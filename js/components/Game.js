import { html, useState, useEffect } from "https://esm.sh/htm/preact/standalone";
import SidePanel from "./SidePanel.js";
import Board from "./Board.js";
import InfoPanel from "./InfoPanel.js";
import ActionPanel from "./ActionPanel.js";
import StatusBar from "./StatusBar.js";
import { deepClone } from "../utils.js";
import Engine from "../engine.js";

const engine = Engine();

const Game = ({ initialGameState, playingAs = 0 }) => {
  const [newGameState, setGameState] = useState(initialGameState);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [potentialAction, setPotentialAction] = useState({});
  const [activeUnit, setActiveUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showDangerArea, setShowDangerArea] = useState(true);

  const gameState = deepClone(newGameState);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (gameState.mode === "duel") {
    useEffect(() => {
      const MIN_DELAY = 500;
      if (gameState.currentTurn !== playingAs && !gameState.isSwapPhase && !gameState.gameOver) {
        const startTime = Date.now();
        const info = engine.search(gameState, 3);
        engine.executeAction(gameState, info.best);
        const timeTaken = Date.now() - startTime;
        const delay = Math.max(MIN_DELAY - timeTaken, 0);
        const timeout = setTimeout(() => setGameState(gameState), delay);
        return () => clearTimeout(timeout);
      }
    }, [
      gameState.currentTurn,
      gameState.turnCount,
      gameState.isSwapPhase,
      gameState.duelState[0].actionsRemaining,
      gameState.duelState[1].actionsRemaining,
      playingAs,
    ]);
  }

  const endTurn = () => {
    engine.endTurn(gameState);
    setGameState(gameState);
    setActiveUnit(null);
  }

  const endSwapPhase = () => {
    // temp code
    if (playingAs === 1) {
      engine.swapStartingPositions(gameState, gameState.teams[0][0].pos, gameState.teams[0][2].pos);
    }
    engine.endSwapPhase(gameState);
    setGameState(gameState);
  }

  return html`
  ${isWideScreen && html`<${SidePanel} />`}
  <div class="screen">
    <${InfoPanel} gameState=${gameState} unit=${selectedUnit} potentialAction=${potentialAction} playingAs=${playingAs} />
    ${gameState.mode === "duel" && html`
      <div class="score-bar">
        <div class="score blue">
          <img src="assets/maps/common/koIcon.webp" />
          <span>${gameState.duelState[0].koScore}</span>
        </div>
        <div class="score blue">
          <img src="assets/maps/common/captureIcon.webp" />
          <span>${gameState.duelState[0].captureScore}</span>
        </div>
        <div class="captain-skill"></div>
        <div class="captain-skill"></div>
        <div class="score red">
          <img src="assets/maps/common/koIcon.webp" />
          <span>${gameState.duelState[1].koScore}</span>
        </div>
        <div class="score red">
          <img src="assets/maps/common/captureIcon.webp" />
          <span>${gameState.duelState[1].captureScore}</span>
        </div>
      </div>
      `}
    <${Board}
      gameState=${gameState} setGameState=${setGameState}
      potentialAction=${potentialAction} setPotentialAction=${setPotentialAction}
      activeUnit=${activeUnit} setActiveUnit=${setActiveUnit}
      selectedUnit=${selectedUnit} setSelectedUnit=${setSelectedUnit}
      showDangerArea=${showDangerArea}
      playingAs=${playingAs} />
    <${ActionPanel} gameState=${gameState} endTurn=${endTurn} setShowDangerArea=${setShowDangerArea} endSwapPhase=${endSwapPhase} playingAs=${playingAs} />
    <${StatusBar} turn=${gameState.turnCount} currentTurn=${gameState.currentTurn} playingAs=${playingAs} />
  </div>
  ${isWideScreen && html`<${SidePanel} />`}
  `;
}

export default Game;
