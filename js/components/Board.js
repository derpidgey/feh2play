import { html, useState, useRef, useMemo } from "https://esm.sh/htm/preact/standalone";
import Unit from "./Unit.js";
import Engine from "../engine.js";
import useResizeListener from "../hooks/useResizeListener.js";
import Timer from "./Timer.js";
import ActionTracker from "./ActionTracker.js";
import useBoardAnimations from "../hooks/useBoardAnimations.js";
import BoardLayerBlocks from "./BoardLayerBlocks.js";
import BoardLayerTiles from "./BoardLayerTiles.js";
import BoardLayerAction from "./BoardLayerAction.js";
import BoardLayerSpecial from "./BoardLayerSpecial.js";

const engine = Engine();

const Board = ({ gameState, activeUnit, validActions, potentialAction, animationSequence, onAnimationComplete, handleTileClick, lastClick, showDangerArea, playingAs, swapDone }) => {
  const { unitPositions, isAnimating, phaseOverlay, turnOverlay } = useBoardAnimations(gameState, animationSequence, onAnimationComplete);
  const [tileSize, setTileSize] = useState(50);

  const boardRef = useRef(null);

  const isDuel = gameState.mode === "duel";
  const boardWidth = gameState.map.terrain[0].length;
  const boardHeight = gameState.map.terrain.length;

  useResizeListener(() => {
    if (boardRef.current) {
      const containerWidth = boardRef.current.getBoundingClientRect().width;
      const newTileSize = containerWidth / boardWidth;
      setTileSize(newTileSize);
    }
  }, 10);

  const calculateHighlightedTiles = () => {
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
      const lastClickedUnit = [...gameState.teams[0], ...gameState.teams[1]]
        .filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)
        .find(unit => unit.pos.x === lastClick.tile.x && unit.pos.y === lastClick.tile.y);
      if (lastClickedUnit && (lastClickedUnit.team !== playingAs || !lastClickedUnit.hasAction || gameState.currentTurn !== playingAs)) {
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
    return highlightedTiles;
  }

  const highlightedTiles = useMemo(() => calculateHighlightedTiles(), [
    gameState,
    activeUnit,
    validActions,
    lastClick,
    showDangerArea,
    playingAs
  ]);

  const handleBoardClick = e => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const x = Math.floor(offsetX / tileSize);
    const y = Math.floor(offsetY / tileSize);
    handleTileClick(x, y);
  }

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
    <${BoardLayerBlocks} map=${gameState.map} tileSize=${tileSize} />
    <${BoardLayerTiles} highlightedTiles=${highlightedTiles} boardWidth=${boardWidth} boardHeight=${boardHeight} tileSize=${tileSize} />
    <${BoardLayerAction} potentialAction=${potentialAction} boardWidth=${boardWidth} boardHeight=${boardHeight} tileSize=${tileSize} />
    <div class="units">${[...gameState.teams[1], ...gameState.teams[0]]
      .filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)
      .map(unit => {
        let position = unit.pos;
        if (isAnimating) {
          const pendingTp = unitPositions[unit.id].x === position.x
            && unitPositions[unit.id].y === position.y
            && animationSequence.flat()?.find(a => a.type === "tp" && a.id === unit.id);
          position = pendingTp ? pendingTp.to : unitPositions[unit.id];
        } else if (activeUnit?.id === unit.id && potentialAction.to) {
          position = potentialAction.to;
        }
        const showActionIndicator = !gameState.isSwapPhase
          && unit.team === playingAs
          && unit.hasAction
          && gameState.currentTurn === playingAs
          && (!activeUnit || activeUnit.id === unit.id);
        return html`
        <${Unit}
          unit=${unit}
          isCaptain=${gameState.duelState[unit.team]?.captain === unit.id}
          tileSize=${tileSize}
          position=${position}
          showActionIndicator=${showActionIndicator} />`;
      })}</div>
    <${BoardLayerSpecial} activeUnit=${activeUnit} potentialAction=${potentialAction} boardWidth=${boardWidth} boardHeight=${boardHeight} tileSize=${tileSize} />
    ${isDuel && html`<div class="corner" style=${getCornerStyle(0, 0)}>
      <${ActionTracker} tileSize=${tileSize} gameState=${gameState} />
    </div>`}
    ${isDuel && html`<div class="corner" style=${getCornerStyle(6, 8)}><${Timer} tileSize=${tileSize} /></div>`}
    ${phaseOverlay && html`
      <div class="board-overlay text-center py-5" style="background: rgba(0, 0, 0, 0.6);top:${tileSize * 2.5}px; height:${tileSize * 3.5}px">
        <span class="h1 text-white">${gameState.currentTurn === 0 ? "BLUE" : "RED"} PHASE</span><br/>
        <span class="text-white">${gameState.currentTurn === playingAs ? "Your" : "Opponent's"} move</span>
      </div>
    `}
    ${turnOverlay && html`
      <div class="board-overlay text-center py-5" style="background: rgba(0, 0, 0, 0.6);top:${tileSize * 2.5}px; height:${tileSize * 3}px">
        <span class="h1 text-white">Turn ${gameState.turnCount} / 5</span><br/>
        <span class="text-white">${gameState.currentTurn === playingAs ? "You move" : "Opponent moves"} first.</span>
      </div>
    `}
    ${((gameState.isSwapPhase && swapDone) || (!isAnimating && gameState.currentTurn !== playingAs && !gameState.isSwapPhase)) && html`
      <div class="board-overlay text-center py-1" style="background: rgba(0, 0, 0, 0.4);top:${tileSize * 4.5}px; height:${tileSize}px">
        <span class="text-white">Waiting for opponent${false ? "<br/>Time: 26 plus 10" : ""}</span>
      </div>
    `}
  </div>
  `;
}

export default Board;
