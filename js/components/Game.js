import { html, useState, useEffect, useCallback } from "https://esm.sh/htm/preact/standalone";
import SidePanel from "./SidePanel.js";
import Board from "./Board.js";
import InfoPanel from "./InfoPanel.js";
import ActionPanel from "./ActionPanel.js";
import StatusBar from "./StatusBar.js";
import Engine from "../engine.js";
import useResizeListener from "../hooks/useResizeListener.js";
import useGameLogic from "../hooks/useGameLogic.js";

const engine = Engine();
const DOUBLE_CLICK_THRESHOLD_MS = 200;
const WIDE_SCREEN_THRESHOLD = 768;

const Game = ({ initialGameState, playingAs = 0, onGameOver }) => {
  const { gameState, executeAction, endTurn, endSwapPhase, swapStartingPositions, getAiMove } = useGameLogic(initialGameState);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [potentialAction, setPotentialAction] = useState({});
  const [activeUnit, setActiveUnit] = useState(null);
  const [validActions, setValidActions] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showDangerArea, setShowDangerArea] = useState(true);
  const [lastClick, setLastClick] = useState({ tile: { x: 0, y: 0 }, time: 0 });
  const [animationSequence, setAnimationSequence] = useState([]);
  const [onAnimationComplete, setOnAnimationComplete] = useState(() => () => { });

  const boardWidth = gameState.map.terrain[0].length;
  const boardHeight = gameState.map.terrain.length;
  const isAnimating = animationSequence.length > 0;

  if (gameState.gameOver) {
    onGameOver(gameState.duelState[playingAs].result);
  }

  useResizeListener(() => setIsWideScreen(window.innerWidth > WIDE_SCREEN_THRESHOLD));

  if (gameState.mode === "duel") {
    useEffect(() => {
      if (gameState.currentTurn !== playingAs && !gameState.isSwapPhase && !gameState.gameOver) {
        handleAction(getAiMove());
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

  const onEndTurn = () => {
    endTurn();
    setActiveUnit(null);
  }

  const onEndSwapPhase = () => {
    // temp code
    if (playingAs === 1) {
      engine.swapStartingPositions(gameState, gameState.teams[0][0].pos, gameState.teams[0][2].pos);
    }
    endSwapPhase();
  }

  const deselectUnit = () => {
    // setHighlightedTiles([]);
    setActiveUnit(null);
    setPotentialAction({});
    setValidActions([]);
  }

  const handleAction = action => {
    const { sequence, onComplete } = executeAction(action);
    deselectUnit();
    if (sequence.length === 0) {
      onComplete();
    } else {
      if (gameState.currentTurn === playingAs) {
        sequence[0][0].type = "tp";
      }
      setAnimationSequence(sequence);
      setOnAnimationComplete(() => () => {
        setAnimationSequence([]);
        onComplete();
      });
    }
  }

  const handleTileClick = (x, y) => {
    if (isAnimating) return;
    if (x < 0 || y < 0 || x >= boardWidth || y >= boardHeight) return;
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClick.time;
    const prevTile = lastClick.tile;
    setLastClick({ tile: { x, y }, time: currentTime });
    if (!gameState.isSwapPhase && timeSinceLastClick <= DOUBLE_CLICK_THRESHOLD_MS && prevTile.x === x && prevTile.y === y) {
      const doubleTapActiveUnit = activeUnit && activeUnit.hasAction && activeUnit.pos.x === x && activeUnit.pos.y === y;
      const doubleTapAllyUnit = !activeUnit && gameState.teams[playingAs].some(unit => unit.hasAction && unit.pos.x === x && unit.pos.y === y);
      if (doubleTapActiveUnit || doubleTapAllyUnit) {
        handleAction({ from: { x, y }, to: { x, y } });
        return;
      }
    }
    if (!activeUnit) {
      queryTile(x, y);
      return;
    }
    handlePotentialActions(x, y);
  }

  const queryTile = (x, y) => {
    // setHighlightedTiles([]);
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]].find(unit => unit.pos.x === x && unit.pos.y === y);
    if (!clickedUnit) {
      // console.log(`Empty tile clicked at (${x}, ${y})`);
      return;
    }
    // console.log(`Unit ${UNIT[clickedUnit.unitId].name} clicked at (${x}, ${y})`);
    setSelectedUnit(clickedUnit);
    const isAlly = gameState.teams[playingAs].includes(clickedUnit);
    const eligibleToMove = isAlly && (gameState.isSwapPhase || (gameState.currentTurn === playingAs && clickedUnit.hasAction));

    if (eligibleToMove) {
      setActiveUnit(clickedUnit);
      setValidActions(engine.generateActions(gameState, clickedUnit));
    }
  }

  const getPotentialActionForTarget = target => {
    const validActionsWithTarget = validActions.filter(action => action.target?.x === target.pos.x && action.target?.y === target.pos.y);
    if (validActionsWithTarget.length === 0) {
      return null;
    }
    const source = potentialAction.to ?? activeUnit.pos;
    const closestAction = validActionsWithTarget.reduce((closest, current) => {
      const distanceToCurrent = Math.abs(current.to.x - source.x) + Math.abs(current.to.y - source.y);
      const distanceToClosest = Math.abs(closest.to.x - source.x) + Math.abs(closest.to.y - source.y);
      return distanceToCurrent < distanceToClosest ? current : closest;
    });
    return closestAction;
  }

  const getPotentialAction = (x, y) => {
    const clickedUnit = gameState.teams[0].concat(gameState.teams[1]).find(unit => unit.pos.x === x && unit.pos.y === y);
    if (clickedUnit) {
      return getPotentialActionForTarget(clickedUnit);
    }
    const validActionWithSameTarget = validActions.find(action =>
      action.target && potentialAction.target
      && action.target.x === potentialAction.target.x && action.target.y === potentialAction.target.y
      && action.to.x === x && action.to.y === y
      && (potentialAction.to.x !== x || potentialAction.to.y !== y)
    );
    if (validActionWithSameTarget) return validActionWithSameTarget;
    const validMoveAction = validActions.find(action => action.to.x === x && action.to.y === y);
    if (validMoveAction) return validMoveAction;
    return null;
  }

  const handlePotentialActions = (x, y) => {
    if (activeUnit.pos.x === x && activeUnit.pos.y === y) {
      deselectUnit();
      return;
    }
    if (gameState.isSwapPhase) {
      const clickedAlly = [...gameState.teams[playingAs]].find(unit => unit.pos.x === x && unit.pos.y === y);
      if (clickedAlly) {
        swapStartingPositions(activeUnit.pos, clickedAlly.pos);
        deselectUnit();
      }
      return;
    }
    const newPotentialAction = getPotentialAction(x, y);
    if (newPotentialAction) {
      if (engine.actionEquals(potentialAction, newPotentialAction)) {
        handleAction(potentialAction);
        return;
      }
      setPotentialAction(newPotentialAction);
      // console.log(`Set potential action: move from (${newPotentialAction.from.x}, ${newPotentialAction.from.y}) to (${newPotentialAction.to.x}, ${newPotentialAction.to.y})` +
      //   (newPotentialAction.target ? ` and target (${newPotentialAction.target.x}, ${newPotentialAction.target.y}).` : '.'));
      return;
    }
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]].find(unit => unit.pos.x === x && unit.pos.y === y);
    if (clickedUnit) {
      setSelectedUnit(clickedUnit);
      // console.log(`Selected unit at (${x}, ${y}) but no valid actions available.`);
      return;
    }
    let outerRange = engine.calculateThreatRange(gameState, activeUnit, false);
    if (outerRange.length === 0) {
      outerRange = engine.calculateMovementRange(gameState, activeUnit, false);
    }
    if (!outerRange.some(tile => tile.x === x && tile.y === y)) {
      // console.log(`(${x}, ${y}) is outside of range. Deselecting.`);
      deselectUnit();
    } else {
      // console.log(`(${x}, ${y}) is within attack range but no valid move action found.`);
    }
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
    <${Board} gameState=${gameState} activeUnit=${activeUnit} validActions=${validActions} potentialAction=${potentialAction}
      animationSequence=${animationSequence} onAnimationComplete=${onAnimationComplete}
      handleTileClick=${handleTileClick} lastClick=${lastClick} showDangerArea=${showDangerArea} playingAs=${playingAs} />
    <${ActionPanel} gameState=${gameState} onEndTurn=${onEndTurn} setShowDangerArea=${setShowDangerArea} onEndSwapPhase=${onEndSwapPhase} playingAs=${playingAs} />
    <${StatusBar} turn=${gameState.turnCount} currentTurn=${gameState.currentTurn} playingAs=${playingAs} />
  </div>
  ${isWideScreen && html`<${SidePanel} />`}
  `;
}

export default Game;
