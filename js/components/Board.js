import { html, useState, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";
import Tile from "./Tile.js";
import Unit from "./Unit.js";
import Engine from "../engine.js";
import useResizeListener from "../hooks/useResizeListener.js";
import Timer from "./Timer.js";
import ActionTracker from "./ActionTracker.js";
import { SPECIAL_TYPE } from "../data/definitions.js";

const engine = Engine();
const FPS = 1000 / 30;
const blockSheet = new Image();
blockSheet.src = "assets/maps/common/Wallpattern.webp";

const specialIcon = new Image();
specialIcon.src = "assets/icons/aoeIcon.png";

const Board = ({ gameState, activeUnit, validActions, potentialAction, animationSequence, onAnimationComplete, handleTileClick, lastClick, showDangerArea, playingAs }) => {
  const [tileSize, setTileSize] = useState(50);
  const [phaseOverlay, setPhaseOverlay] = useState(false);
  const [turnOverlay, setTurnOverlay] = useState(false);
  const unitPositionsRef = useRef(gameState.teams[0]
    .concat(gameState.teams[1])
    .reduce((acc, unit) => {
      acc[unit.id] = { x: unit.pos.x, y: unit.pos.y };
      return acc;
    }, {}));
  const [unitPositions, setUnitPositions] = useState(unitPositionsRef.current);

  const boardRef = useRef(null);
  const actionCanvasRef = useRef(null);
  const blockCanvasRef = useRef(null);
  const specialCanvasRef = useRef(null);

  const isDuel = gameState.mode === "duel";
  const boardWidth = gameState.map.terrain[0].length;
  const boardHeight = gameState.map.terrain.length;
  const isAnimating = animationSequence.length > 0;

  useResizeListener(() => {
    if (boardRef.current) {
      const containerWidth = boardRef.current.getBoundingClientRect().width;
      const newTileSize = containerWidth / boardWidth;
      setTileSize(newTileSize);
    }
  }, 10);

  const handleMoveAnimation = (animation, resolve) => {
    const { id, to } = animation;
    const frames = 8;
    const from = unitPositionsRef.current[id];
    const dx = (to.x - from.x) / frames;
    const dy = (to.y - from.y) / frames;
    let frame = 0;
    const interval = setInterval(() => {
      if (frame >= frames) {
        clearInterval(interval);
        unitPositionsRef.current[id] = { ...to };
        setUnitPositions({ ...unitPositionsRef.current });
        resolve();
      } else {
        unitPositionsRef.current[id] = {
          x: unitPositionsRef.current[id].x + dx,
          y: unitPositionsRef.current[id].y + dy
        };
        setUnitPositions({ ...unitPositionsRef.current });
        frame++;
      }
    }, FPS);
  }

  const handleAttackAnimation = (animation, resolve) => {
    const { id, target } = animation;
    const frames = 6;
    const from = unitPositionsRef.current[id];
    const dx = (target.x - from.x) / 10;
    const dy = (target.y - from.y) / 10;
    let frame = 0;
    const originalPosition = { ...from };
    const interval = setInterval(() => {
      if (frame < 3) {
        // Advance phase
        unitPositionsRef.current[id] = {
          x: unitPositionsRef.current[id].x + dx,
          y: unitPositionsRef.current[id].y + dy,
        };
      } else if (frame < frames) {
        // Retreat phase
        unitPositionsRef.current[id] = {
          x: unitPositionsRef.current[id].x - dx,
          y: unitPositionsRef.current[id].y - dy,
        };
      } else {
        clearInterval(interval);
        unitPositionsRef.current[id] = originalPosition;
        setUnitPositions({ ...unitPositionsRef.current });
        resolve();
        return;
      }
      setUnitPositions({ ...unitPositionsRef.current });
      frame++;
    }, FPS);
  }

  useEffect(() => {
    if (!animationSequence || animationSequence.length === 0) return;
    unitPositionsRef.current = gameState.teams[0]
      .concat(gameState.teams[1])
      .reduce((acc, unit) => {
        acc[unit.id] = { x: unit.pos.x, y: unit.pos.y };
        return acc;
      }, {});
    setUnitPositions({ ...unitPositionsRef.current });
    const animate = async () => {
      for (const animationBatch of animationSequence) {
        const animations = animationBatch.map(animation => {
          return new Promise(resolve => {
            if (animation.type === "move") {
              handleMoveAnimation(animation, resolve);
            } else if (animation.type === "attack") {
              handleAttackAnimation(animation, resolve);
            } else if (animation.type === "tp") {
              const { id, to } = animation;
              unitPositionsRef.current[id] = {
                x: to.x,
                y: to.y
              };
              setUnitPositions({ ...unitPositionsRef.current });
              resolve();
            } else if (animation.type === "currentTurn") {
              const turnChanges = animationSequence.flat().filter(animation => animation.type === "currentTurn");
              const startTurn = animationSequence.flat().filter(animation => animation.type === "startTurn");
              if (turnChanges.length === 1 && startTurn.length === 0) {
                setPhaseOverlay(true);
                setTimeout(() => {
                  setPhaseOverlay(false);
                  resolve();
                }, 1000);
              } else {
                resolve();
              }
            } else if (animation.type === "startTurn") {
              setTurnOverlay(true);
              setTimeout(() => {
                setTurnOverlay(false);
                resolve();
              }, 1000);
            } else {
              // console.warn(`Unhandled animation type ${animation.type}`);
              resolve();
            }
          });
        });
        await Promise.all(animations);
      }
      onAnimationComplete();
    };

    animate();
  }, [animationSequence]);

  useEffect(() => {
    const actionCanvas = actionCanvasRef.current;
    const specialCanvas = specialCanvasRef.current;
    if (!actionCanvas || !specialCanvas) return;
    const actionCtx = actionCanvas.getContext("2d");
    const specialCtx = specialCanvas.getContext("2d");
    actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
    specialCtx.clearRect(0, 0, specialCanvas.width, specialCanvas.height);
    if (!potentialAction.from) return;
    const path = potentialAction.to.path ?? [];
    actionCtx.strokeStyle = "rgba(173, 216, 230, 0.5)";
    actionCtx.lineWidth = tileSize / 3;
    actionCtx.lineJoin = "round";
    actionCtx.lineCap = "round";
    actionCtx.beginPath();
    if (path.length === 0) {
      actionCtx.fillStyle = actionCtx.strokeStyle;
      actionCtx.arc(potentialAction.from.x * tileSize + tileSize / 2, potentialAction.from.y * tileSize + tileSize / 2, tileSize / 6, 0, 2 * Math.PI);
      actionCtx.fill();
    } else {
      actionCtx.moveTo(path[0].x * tileSize + tileSize / 2, path[0].y * tileSize + tileSize / 2);
      path.forEach(point => actionCtx.lineTo(point.x * tileSize + tileSize / 2, point.y * tileSize + tileSize / 2));
      actionCtx.stroke();
    }
    if (potentialAction.type === "attack" && activeUnit.special.current === 0) {
      const specialInfo = engine.getSpecialInfo(activeUnit);
      if (specialInfo.specialType === SPECIAL_TYPE.AOE) {
        specialInfo.aoe.shape.forEach(({ x, y }) => {
          const tileX = (potentialAction.target.x + x) * tileSize;
          const tileY = (potentialAction.target.y + y) * tileSize;
          const iconSize = tileSize * 0.8;
          const offset = (tileSize - iconSize) / 2;
          specialCtx.drawImage(
            specialIcon,
            tileX + offset,
            tileY + offset,
            iconSize,
            iconSize
          );
        });
      }
    }
  }, [potentialAction]);

  const ATLAS_TILE = 182;
  const PILLAR_COL = 9;

  const BIT_N = 1; // 0001
  const BIT_E = 2; // 0010
  const BIT_S = 4; // 0100
  const BIT_W = 8; // 1000

  const MASK_TO_COORDS = {
    0: { x: 9, y: 0 },
    1: { x: 6, y: 3 },  // N
    2: { x: 3, y: 4 },  // E
    3: { x: 3, y: 3 },  // NE
    4: { x: 0, y: 4 },  // S
    5: { x: 3, y: 0 },  // NS
    6: { x: 3, y: 2 },  // ES
    7: { x: 3, y: 1 },  // NES
    8: { x: 6, y: 4 },  // W
    9: { x: 0, y: 3 },  // NW
    10: { x: 0, y: 0 },  // EW
    11: { x: 6, y: 0 },  // NEW
    12: { x: 6, y: 2 },  // SW
    13: { x: 6, y: 1 },  // NSW
    14: { x: 0, y: 1 },  // ESW
    15: { x: 0, y: 2 }   // NESW
  };

  function getOffset(block) {
    if (!block || !block.breakable) return 0;
    if (block.hp >= 2) return 1;
    if (block.hp === 1) return 2;
    console.warn("Invalid block", block);
  }

  function getBlockSprite(block, mask) {
    if (block?.hp <= 0) {
      const variantRow = (block.x + block.y) % 2 === 0 ? 3 : 4;
      return {
        x: PILLAR_COL * ATLAS_TILE,
        y: variantRow * ATLAS_TILE,
        w: ATLAS_TILE,
        h: ATLAS_TILE
      };
    }

    let { x, y } = MASK_TO_COORDS[mask];
    if (mask === 0) {
      y += getOffset(block);
    } else {
      x += getOffset(block);
    }
    return {
      x: x * ATLAS_TILE,
      y: y * ATLAS_TILE,
      w: ATLAS_TILE,
      h: ATLAS_TILE
    };
  }

  const getNeighborMask = (block, blocks) => {
    const map = new Map();
    for (const b of blocks) map.set(`${b.x},${b.y}`, b);

    let mask = 0;
    const sameType = (other) => other && (Boolean(other.breakable) === Boolean(block.breakable));

    const north = map.get(`${block.x},${block.y - 1}`);
    if (sameType(north)) mask |= BIT_N;
    const east = map.get(`${block.x + 1},${block.y}`);
    if (sameType(east)) mask |= BIT_E;
    const south = map.get(`${block.x},${block.y + 1}`);
    if (sameType(south)) mask |= BIT_S;
    const west = map.get(`${block.x - 1},${block.y}`);
    if (sameType(west)) mask |= BIT_W;

    return mask;
  }

  const renderBlocks = (ctx, atlas, blocks, tileSize, mapWidth, mapHeight) => {
    ctx.clearRect(0, 0, tileSize * mapWidth, tileSize * mapHeight);

    for (const block of blocks) {
      const neighbors = getNeighborMask(block, blocks);
      const { x, y, w, h } = getBlockSprite(block, neighbors);
      ctx.drawImage(atlas, x, y, w, h, block.x * tileSize, block.y * tileSize, tileSize, tileSize);
    }
  }

  useEffect(() => {
    if (!blockCanvasRef.current) return;
    const ctx = blockCanvasRef.current.getContext("2d");
    renderBlocks(ctx, blockSheet, gameState.map.blocks, tileSize, boardWidth, boardHeight);
  }, [gameState.map, gameState.map.blocks, tileSize]);

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
      const lastClickedUnit = gameState.teams[0].concat(gameState.teams[1])
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

  const highlightedTiles = calculateHighlightedTiles();

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
    <canvas
      ref=${blockCanvasRef}
      width=${tileSize * boardWidth}
      height=${tileSize * boardHeight}
      style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
    <div class="tile-container">
      ${highlightedTiles.map(tile => html`<${Tile} x=${tile.x} y=${tile.y} size=${tileSize} colour=${tile.colour} />`)}
    </div>
    <canvas 
      ref=${actionCanvasRef}
      width=${tileSize * boardWidth}
      height=${tileSize * boardHeight}
      style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
    <div class="units">${[...gameState.teams[1], ...gameState.teams[0]]
      .filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)
      .map(unit => {
        let position = unit.pos;
        if (isAnimating) {
          const pendingTp = animationSequence.flat()?.find(a => a.type === "tp" && a.id === unit.id);
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
    <canvas 
      ref=${specialCanvasRef}
      width=${tileSize * boardWidth}
      height=${tileSize * boardHeight}
      style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
    ${isDuel && html`<div class="corner" style=${getCornerStyle(0, 0)}>
      <${ActionTracker} tileSize=${tileSize} gameState=${gameState} />
    </div>`}
    ${isDuel && html`<div class="corner" style=${getCornerStyle(6, 8)}><${Timer} tileSize=${tileSize} /></div>`}
    ${phaseOverlay && html`
      <div class="board-overlay text-center py-5" style="background: rgba(0, 0, 0, 0.6);top:${tileSize * 2.5}px; height:${tileSize * 3.5}px">
        <span class="h1 text-white">${gameState.currentTurn === 0 ? "BLUE" : "RED"} PHASE</span><br/>
        <span class="text-white">${gameState.currentTurn === playingAs ? "Noob Player" : "Big Brain"}'s move</span>
      </div>
    `}
    ${turnOverlay && html`
      <div class="board-overlay text-center py-5" style="background: rgba(0, 0, 0, 0.6);top:${tileSize * 2.5}px; height:${tileSize * 3}px">
        <span class="h1 text-white">Turn ${gameState.turnCount} / 5</span><br/>
        <span class="text-white">${gameState.currentTurn === playingAs ? "Noob Player" : "Big Brain"} moves first.</span>
      </div>
    `}
    ${!isAnimating && gameState.currentTurn !== playingAs && !gameState.isSwapPhase && html`
      <div class="board-overlay text-center py-1" style="background: rgba(0, 0, 0, 0.4);top:${tileSize * 4.5}px; height:${tileSize}px">
        <span class="text-white">Waiting for opponent${false ? "<br/>Time: 26 plus 10" : ""}</span>
      </div>
    `}
  </div>
  `;
}

export default Board;
