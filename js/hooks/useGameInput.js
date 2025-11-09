import { useState, useCallback } from "https://esm.sh/htm/preact/standalone";
import Engine from "../engine.js";
import UNIT from "../data/units.js";

const engine = Engine();
const DOUBLE_CLICK_THRESHOLD_MS = 200;

const useGameInput = ({ gameState, playingAs, isAnimating, handleAction, swapStartingPositions, swapDone, debug = false }) => {
  const [activeUnit, setActiveUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [potentialAction, setPotentialAction] = useState({});
  const [validActions, setValidActions] = useState([]);
  const [lastClick, setLastClick] = useState({ tile: { x: 0, y: 0 }, time: 0 });

  const boardWidth = gameState.map.terrain[0].length;
  const boardHeight = gameState.map.terrain.length;
  const isDuel = gameState.mode === "duel";

  const deselectUnit = () => {
    setActiveUnit(null);
    setPotentialAction({});
    setValidActions([]);
  }

  const clearActiveUnit = () => {
    setActiveUnit(null);
  }

  const queryTile = (x, y) => {
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]]
      .filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)
      .find(unit => unit.pos.x === x && unit.pos.y === y);
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
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]]
      .find(unit => unit.pos.x === x && unit.pos.y === y);
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
    if (!activeUnit) return;
    if (activeUnit.pos.x === x && activeUnit.pos.y === y) {
      deselectUnit();
      return;
    }
    if (gameState.isSwapPhase) {
      const clickedAlly = gameState.teams[playingAs].find(unit => unit.pos.x === x && unit.pos.y === y);
      if (clickedAlly) {
        if (swapDone) {
          setSelectedUnit(clickedAlly);
          setActiveUnit(clickedAlly);
          return;
        }
        swapStartingPositions(activeUnit.pos, clickedAlly.pos);
        deselectUnit();
      }
      return;
    }
    const newPotentialAction = getPotentialAction(x, y);
    if (newPotentialAction) {
      if (engine.actionEquals(potentialAction, newPotentialAction)) {
        handleAction(potentialAction);
        deselectUnit();
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

  const handleTileClick = useCallback((x, y) => {
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
        handleAction(validActions.find(action => action.type === "move" && action.to.x === action.from.x && action.to.y === action.from.y));
        deselectUnit();
        return;
      }
    }
    if (!activeUnit) {
      queryTile(x, y);
      return;
    }
    handlePotentialActions(x, y);
  }, [isAnimating, gameState, activeUnit, lastClick, potentialAction, validActions]);

  return {
    activeUnit,
    selectedUnit,
    potentialAction,
    validActions,
    lastClick,
    handleTileClick,
    deselectUnit,
    clearActiveUnit
  };
}

export default useGameInput;
