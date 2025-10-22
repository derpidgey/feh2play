import { html, useState, useEffect } from "https://esm.sh/htm/preact/standalone";
import SidePanel from "./SidePanel.js";
import Board from "./Board.js";
import InfoPanel from "./InfoPanel.js";
import ActionPanel from "./ActionPanel.js";
import StatusBar from "./StatusBar.js";
import Engine from "../engine.js";
import useResizeListener from "../hooks/useResizeListener.js";
import useGameLogic from "../hooks/useGameLogic.js";
import UNIT from "../data/units.js";
import CAPTAIN_SKILLS from "../data/captainSkills.js";
import { SKILL_TYPE } from "../data/definitions.js";
import SKILLS from "../data/skills.js";

const engine = Engine();
const DOUBLE_CLICK_THRESHOLD_MS = 200;

const Game = ({ initialGameState, playingAs = 0, onGameOver, debug = false }) => {
  const { gameState, executeAction, endTurn, endSwapPhase, swapStartingPositions, getAiMove } = useGameLogic(initialGameState, playingAs);
  const [fontSize, setFontSize] = useState("16px");
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
  const isDuel = gameState.mode === "duel";
  const backgroundType = isDuel ? "absolute" : "relative";

  if (gameState.gameOver) {
    onGameOver(gameState.duelState[playingAs].result, 1000);
  }

  useResizeListener(() => {
    setIsWideScreen(window.innerWidth >= window.innerHeight * 3 / 2);
    setFontSize(`${Math.min(window.innerWidth, window.innerHeight / 2) * 0.04}px`);
  }, 10);

  if (gameState.mode === "duel") {
    useEffect(() => {
      const runAiTurn = async () => {
        if (gameState.currentTurn === playingAs || gameState.isSwapPhase || gameState.gameOver || isAnimating) return;
        const move = await getAiMove();
        handleAction(move);
      }
      runAiTurn();
    }, [gameState.currentTurn, gameState.isSwapPhase, playingAs, isAnimating]);

    useEffect(() => {
      const runAiTurn = async e => {
        if (debug && e.code === "KeyZ") {
          if (gameState.currentTurn !== playingAs || gameState.isSwapPhase || gameState.gameOver || isAnimating) return;
          const move = await getAiMove();
          handleAction(move);
        }
      }
      document.addEventListener("keydown", runAiTurn);
      return () => document.removeEventListener("keydown", runAiTurn);
    }, [gameState, playingAs, isAnimating]);
  }

  const onEndTurn = () => {
    endTurn();
    setActiveUnit(null);
  }

  const onEndSwapPhase = () => {
    // swap phase book moves here
    // if (playingAs === 1) {
    //   engine.swapStartingPositions(gameState, gameState.teams[0][0].pos, gameState.teams[0][2].pos);
    // }
    deselectUnit();
    endSwapPhase();
  }

  const deselectUnit = () => {
    setActiveUnit(null);
    setPotentialAction({});
    setValidActions([]);
  }

  const handleAction = action => {
    const { sequence, updateGameState } = executeAction(action);
    if (sequence.length > 0 && gameState.currentTurn === playingAs && Object.keys(potentialAction).length > 0) {
      sequence[0][0].type = "tp";
    }
    deselectUnit();

    const mainSequence = [];
    const afterUpdateSequence = [];

    let foundTurn = false;

    for (const batch of sequence) {
      if (foundTurn) {
        afterUpdateSequence.push(batch);
      } else if (batch.some(animation => animation.type === "currentTurn")) {
        foundTurn = true;
        afterUpdateSequence.push(batch);
      } else {
        mainSequence.push(batch);
      }
    }

    const runAfterUpdateSequence = () => {
      if (afterUpdateSequence.length > 0) {
        setAnimationSequence(afterUpdateSequence);
        setOnAnimationComplete(() => () => setAnimationSequence([]));
      }
    }

    if (mainSequence.length === 0) {
      updateGameState();
      runAfterUpdateSequence();
    } else {
      setAnimationSequence(mainSequence);
      setOnAnimationComplete(() => () => {
        setAnimationSequence([]);
        updateGameState();
        runAfterUpdateSequence();
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
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]].find(unit => unit.pos.x === x && unit.pos.y === y);
    if (!clickedUnit) {
      if (debug) console.log(`Empty tile clicked at (${x}, ${y})`);
      return;
    }
    if (debug) console.log(`Unit ${UNIT[clickedUnit.unitId].name} clicked at (${x}, ${y})`);
    setSelectedUnit(clickedUnit);
    const isAlly = gameState.teams[playingAs].includes(clickedUnit);
    const eligibleToMove = isAlly && (gameState.isSwapPhase || (gameState.currentTurn === playingAs && clickedUnit.hasAction));

    if (eligibleToMove) {
      setActiveUnit(clickedUnit);
      setValidActions(engine.generateActions(gameState, clickedUnit));
    }
  }

  const getPotentialActionForTargetUnit = target => {
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

  const getPotentialActionForTargetBlock = target => {
    const validActionsWithTarget = validActions.filter(action => action.target?.x === target.x && action.target?.y === target.y);
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
      return getPotentialActionForTargetUnit(clickedUnit);
    }
    const clickedBlock = gameState.map.blocks.find(b => b.breakable && b.hp > 0 && b.x === x && b.y === y);
    if (clickedBlock) {
      return getPotentialActionForTargetBlock(clickedBlock);
    }
    const validActionWithSameTarget = validActions.find(action =>
      action.target && potentialAction.target
      && action.target.x === potentialAction.target.x && action.target.y === potentialAction.target.y
      && action.to.x === x && action.to.y === y
      && (potentialAction.to.x !== x || potentialAction.to.y !== y)
    );
    if (validActionWithSameTarget) return validActionWithSameTarget;
    return validActions.find(action => action.to.x === x && action.to.y === y) ?? null;
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
      if (debug) console.log(`Set potential action: move from (${newPotentialAction.from.x}, ${newPotentialAction.from.y}) to (${newPotentialAction.to.x}, ${newPotentialAction.to.y})` +
        (newPotentialAction.target ? ` and target (${newPotentialAction.target.x}, ${newPotentialAction.target.y}).` : '.'));
      return;
    }
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]].find(unit => unit.pos.x === x && unit.pos.y === y);
    if (clickedUnit) {
      setSelectedUnit(clickedUnit);
      if (debug) console.log(`Selected unit at (${x}, ${y}) but no valid actions available.`);
      return;
    }
    let outerRange = engine.calculateThreatRange(gameState, activeUnit, false);
    if (outerRange.length === 0) {
      outerRange = engine.calculateMovementRange(gameState, activeUnit, false);
    }
    if (!outerRange.some(tile => tile.x === x && tile.y === y)) {
      if (debug) console.log(`(${x}, ${y}) is outside of range. Deselecting.`);
      deselectUnit();
    } else {
      if (debug) console.log(`(${x}, ${y}) is within attack range but no valid move action found.`);
    }
  }

  const getCaptainInfo = unit => {
    if (!unit) return null;
    return CAPTAIN_SKILLS[unit.skills.find(skill => SKILLS[skill].type === SKILL_TYPE.CAPTAIN)];
  }
  const captainSkillsRevealed = [null, null].map((_, i) => i === playingAs || gameState.duelState[i].captainSkillRevealed);
  const captainImages = [null, null].map((_, i) => getCaptainInfo(gameState.teams[i][0])?.img);

  return html`
  ${isWideScreen && html`<${SidePanel} team=${gameState.teams[0].filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)} backgroundType=${backgroundType} playingAs=${playingAs} />`}
  <div class="screen" style="font-size: clamp(0.5rem, ${fontSize}, 1rem);">
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
        <div class="captain-skill">${captainSkillsRevealed[0] && captainImages[0] && html`<img src=${captainImages[0]} />`}</div>
        <div class="captain-skill">${captainSkillsRevealed[1] && captainImages[1] && html`<img src=${captainImages[1]} />`}</div>
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
    <${ActionPanel} gameState=${gameState} onEndTurn=${onEndTurn} setShowDangerArea=${setShowDangerArea} onEndSwapPhase=${onEndSwapPhase} playingAs=${playingAs} surrender=${() => onGameOver("lose", 0)} />
    <${StatusBar} turn=${gameState.turnCount} currentTurn=${gameState.currentTurn} playingAs=${playingAs} />
  </div>
  ${isWideScreen && html`<${SidePanel} team=${gameState.teams[1].filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)} backgroundType=${backgroundType} playingAs=${playingAs} />`}
  `;
}

export default Game;
