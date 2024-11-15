import { html, useState, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";
import Tile from "./Tile.js";
import Unit from "./Unit.js";
import Engine from "../engine.js";
import useResizeListener from "../hooks/useResizeListener.js";
import Timer from "./Timer.js";
import ActionTracker from "./ActionTracker.js";
import UNIT from "../data/units.js";

const engine = Engine();

const DOUBLE_CLICK_THRESHOLD_MS = 250;

const Board = ({ gameState, setGameState, potentialAction, setPotentialAction, activeUnit, setActiveUnit, setSelectedUnit, showDangerArea, playingAs }) => {
  const [tileSize, setTileSize] = useState(50);
  const [validActions, setValidActions] = useState([]);
  const [lastClick, setLastClick] = useState({ tile: { x: 0, y: 0 }, time: 0 });

  const boardRef = useRef(null);
  const canvasRef = useRef(null);

  const boardWidth = gameState.map.terrain[0].length;
  const boardHeight = gameState.map.terrain.length;

  const calculateTileSize = () => {
    if (boardRef.current) {
      const containerWidth = boardRef.current.getBoundingClientRect().width;
      const newTileSize = containerWidth / boardWidth;
      setTileSize(newTileSize);
    }
  };
  calculateTileSize();
  useResizeListener(calculateTileSize, 10);

  const isDuel = gameState.mode === "duel";
  const highlightedTiles = Array.from({ length: boardWidth * boardHeight }, (_, i) => ({
    x: i % boardWidth,
    y: Math.floor(i / boardWidth),
    colour: "transparent"
  }));
  if (showDangerArea && !(isDuel && gameState.isSwapPhase)) {
    gameState.teams[playingAs ^ 1].forEach(enemyUnit => {
      engine.calculateThreatRange(gameState, enemyUnit, false)
        .forEach(({ x, y }) => highlightedTiles[y * boardWidth + x].colour = "rgba(139, 0, 0, 0.3)");
    });
  }
  if (activeUnit) {
    engine.calculateThreatRange(gameState, activeUnit, false)
      .forEach(({ x, y }) => highlightedTiles[y * boardWidth + x].colour = "rgba(255, 0, 0, 0.5)");
    engine.calculateMovementRange(gameState, activeUnit, false)
      .forEach(({ x, y, path }) => highlightedTiles[y * boardWidth + x].colour = path.length > 0 ? "rgba(0, 0, 255, 0.5)" : "rgba(0, 255, 255, 0.5)");
    validActions.forEach(({ type, target }) => {
      if (type === "assist") {
        highlightedTiles[target.y * boardWidth + target.x].colour = "rgba(0, 255, 0, 0.5)";
      }
    });
  } else {
    const lastClickedUnit = gameState.teams[0].concat(gameState.teams[1])
      .find(unit => unit.pos.x === lastClick.tile.x && unit.pos.y === lastClick.tile.y);
    if (lastClickedUnit && (lastClickedUnit.team !== playingAs || !lastClickedUnit.hasAction)) {
      engine.calculateThreatRange(gameState, lastClickedUnit, false)
        .forEach(({ x, y }) => highlightedTiles[y * boardWidth + x].colour = "rgba(255, 0, 0, 0.3)");
      engine.calculateMovementRange(gameState, lastClickedUnit, false)
        .forEach(({ x, y, path }) => highlightedTiles[y * boardWidth + x].colour = path.length > 0 ? "rgba(0, 0, 255, 0.3)" : "rgba(0, 255, 255, 0.3)");
    }
  }
  if (gameState.isSwapPhase) {
    gameState.map.startingPositions[playingAs].forEach(({ x, y }) => highlightedTiles[y * boardWidth + x].colour = "rgba(0, 255, 0, 0.5)");
    if (playingAs === 0) {
      gameState.map.startingPositions[playingAs ^ 1].forEach(({ x, y }) => highlightedTiles[y * boardWidth + x].colour = "rgba(255, 0, 0, 0.3)");
    } else {
      gameState.map.startingPositions[playingAs ^ 1].forEach(({ x, y }) => highlightedTiles[y * boardWidth + x].colour = "rgba(0, 0, 255, 0.3)");
    }
  }

  const deselectUnit = () => {
    // setHighlightedTiles([]);
    clearCanvas();
    setActiveUnit(null);
    setPotentialAction({});
    setValidActions([]);
  }

  const handleBoardClick = e => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const x = Math.floor(offsetX / tileSize);
      const y = Math.floor(offsetY / tileSize);
      handleTileClick(x, y);
    }
  }

  const handleTileClick = (x, y) => {
    if (x < 0 || y < 0 || x >= boardWidth || y >= boardHeight) return;
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClick.time;
    const prevTile = lastClick.tile;
    setLastClick({ tile: { x, y }, time: currentTime });
    if (!gameState.isSwapPhase && timeSinceLastClick <= DOUBLE_CLICK_THRESHOLD_MS && prevTile.x === x && prevTile.y === y) {
      const doubleTapActiveUnit = activeUnit && activeUnit.hasAction && activeUnit.pos.x === x && activeUnit.pos.y === y;
      const doubleTapAllyUnit = !activeUnit && gameState.teams[playingAs].some(unit => unit.hasAction && unit.pos.x === x && unit.pos.y === y);
      if (doubleTapActiveUnit || doubleTapAllyUnit) {
        engine.executeAction(gameState, { from: { x, y }, to: { x, y } });
        setGameState(gameState);
        deselectUnit();
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

  const getPotentialAction = (x, y) => {
    const clickedUnit = [...gameState.teams[0], ...gameState.teams[1]].find(unit => unit.pos.x === x && unit.pos.y === y);
    if (clickedUnit) {
      const validActionsWithTarget = validActions.filter(
        action => action.target && action.target.x === clickedUnit.pos.x && action.target.y === clickedUnit.pos.y
      );
      if (validActionsWithTarget.length > 0) {
        const source = potentialAction.to || activeUnit.pos;
        const closestAction = validActionsWithTarget.reduce((closest, current) => {
          const distanceToCurrent = Math.abs(current.to.x - source.x) + Math.abs(current.to.y - source.y);
          const distanceToClosest = Math.abs(closest.to.x - source.x) + Math.abs(closest.to.y - source.y);
          return distanceToCurrent < distanceToClosest ? current : closest;
        });
        return {
          from: { ...activeUnit.pos },
          to: { ...closestAction.to },
          target: { x, y }
        };
      }
      return null;
    }

    // Check if a different 'to' pos with the same target exists.
    if (potentialAction && potentialAction.target && (potentialAction.to.x !== x || potentialAction.to.y !== y)) {
      const validActionWithSameTarget = validActions.find(
        action => action.target &&
          action.target.x === potentialAction.target.x &&
          action.target.y === potentialAction.target.y &&
          action.to.x === x &&
          action.to.y === y
      );
      if (validActionWithSameTarget) {
        return {
          from: { ...activeUnit.pos },
          to: { x, y },
          target: potentialAction.target
        };
      }
    }

    // Check for a movement action if clicked on an empty tile.
    const validMoveAction = validActions.find(action => action.to.x === x && action.to.y === y);
    if (validMoveAction) {
      return {
        from: { ...activeUnit.pos },
        to: { x, y }
      };
    }

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
        engine.swapStartingPositions(gameState, activeUnit.pos, clickedAlly.pos);
        setGameState(gameState);
        deselectUnit();
      }
      return
    }
    const newPotentialAction = getPotentialAction(x, y);
    if (newPotentialAction) {
      if (engine.actionEquals(potentialAction, newPotentialAction)) {
        engine.executeAction(gameState, potentialAction);
        setGameState(gameState);
        deselectUnit();
        return;
      }
      setPotentialAction(newPotentialAction);
      const tileWithPath = validActions.find(action => action.to.x === newPotentialAction.to.x && action.to.y === newPotentialAction.to.y);
      drawPath(tileWithPath?.to.path || []);
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

  const drawPath = path => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (path.length === 0) return;
    context.strokeStyle = "rgba(173, 216, 230, 0.5)";
    context.lineWidth = tileSize / 3;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(path[0].x * tileSize + tileSize / 2, path[0].y * tileSize + tileSize / 2);
    path.forEach(point => context.lineTo(point.x * tileSize + tileSize / 2, point.y * tileSize + tileSize / 2));
    context.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const unitElements = [...gameState.teams[1], ...gameState.teams[0]]
    .filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)
    .map(unit => {
      const showActionIndicator = !gameState.isSwapPhase
        && unit.team === playingAs
        && unit.hasAction
        && gameState.currentTurn === playingAs
        && (!activeUnit || activeUnit.id === unit.id);
      return html`
      <${Unit}
        unit=${unit}
        isCaptain=${gameState.duelState[unit.team]?.captain === unit.id}
        isActive=${activeUnit?.id === unit.id}
        tileSize=${tileSize}
        potentialAction=${potentialAction}
        showActionIndicator=${showActionIndicator} />`;
    });

  const getCaptureAreaStyle = () => {
    const { x, y, w, h } = gameState.captureArea;
    const IMAGE_SQUARE_SIZE = 135;
    const IMAGE_BORDER_SIZE = 15;
    const scale = tileSize / IMAGE_SQUARE_SIZE;
    return {
      width: `${scale * (IMAGE_SQUARE_SIZE * w + IMAGE_BORDER_SIZE * 2)}px`,
      height: `${scale * (IMAGE_SQUARE_SIZE * h + IMAGE_BORDER_SIZE * 2)}px`,
      top: `${y * tileSize - scale * IMAGE_BORDER_SIZE}px`,
      left: `${x * tileSize - scale * IMAGE_BORDER_SIZE}px`
    }
  }

  const getCornerStyle = (x, y) => {
    return {
      width: `${tileSize * 2}px`,
      height: `${tileSize * 2}px`,
      top: `${y * tileSize}px`,
      left: `${x * tileSize}px`
    }
  }

  return html`
  <div class="board board-${gameState.mode}" ref=${boardRef} onClick=${handleBoardClick}>
    <img src="assets/maps/common/Rival_Domains_Wave.webp" alt="water" />
    <img src=${gameState.map.bg} alt="map" />
    ${isDuel && html`<img src="assets/maps/common/SummonerDuels_PointArea.webp" style=${getCaptureAreaStyle()} alt="capture area" />`}
    <div class="tile-container">
      ${highlightedTiles.map(tile => html`<${Tile} x=${tile.x} y=${tile.y} size=${tileSize} colour=${tile.colour} />`)}
    </div>
    <canvas 
      ref=${canvasRef}
      width=${tileSize * boardWidth}
      height=${tileSize * boardHeight}
      style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
    <div class="units">${unitElements}</div>
    ${isDuel && html`<div class="corner" style=${getCornerStyle(0, 0)}>
      <${ActionTracker} tileSize=${tileSize} gameState=${gameState} />
    </div>`}
    ${isDuel && html`<div class="corner" style=${getCornerStyle(6, 8)}><${Timer} tileSize=${tileSize} /></div>`}
  </div>
  `;
}

export default Board;
