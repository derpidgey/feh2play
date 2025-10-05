import { html, useState, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";
import Tile from "./Tile.js";
import Unit from "./Unit.js";
import Engine from "../engine.js";
import useResizeListener from "../hooks/useResizeListener.js";
import Timer from "./Timer.js";
import ActionTracker from "./ActionTracker.js";

const engine = Engine();
const FPS = 1000 / 30;

const Board = ({ gameState, activeUnit, validActions, potentialAction, animationSequence, onAnimationComplete, handleTileClick, lastClick, showDangerArea, playingAs }) => {
  const [tileSize, setTileSize] = useState(50);
  const unitPositionsRef = useRef(gameState.teams[0]
    .concat(gameState.teams[1])
    .reduce((acc, unit) => {
      acc[unit.id] = { x: unit.pos.x, y: unit.pos.y };
      return acc;
    }, {}));
  const [unitPositions, setUnitPositions] = useState(unitPositionsRef.current);

  const boardRef = useRef(null);
  const canvasRef = useRef(null);
  const blockCanvasRef = useRef(null);

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
            } else {
              console.warn(`Unhandled animation type ${animation.type}`);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const tileWithPath = validActions.find(action => action.to.x === potentialAction.to?.x && action.to.y === potentialAction.to?.y);
    const path = tileWithPath?.to.path || [];
    if (path.length === 0) return;
    context.strokeStyle = "rgba(173, 216, 230, 0.5)";
    context.lineWidth = tileSize / 3;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(path[0].x * tileSize + tileSize / 2, path[0].y * tileSize + tileSize / 2);
    path.forEach(point => context.lineTo(point.x * tileSize + tileSize / 2, point.y * tileSize + tileSize / 2));
    context.stroke();
  }, [potentialAction]);

  const blockSheet = useRef(null);

  const ATLAS_TILE = 182;
  const PILLAR_COL = 9;

  const BIT_N = 1; // 0001
  const BIT_E = 2; // 0010
  const BIT_S = 4; // 0100
  const BIT_W = 8; // 1000

  const MASK_TO_ROW = {
    0: 0,
    1: 3,     // N
    2: 4,     // E
    3: 3,     // NE
    4: 4,     // S
    5: 0,     // NS
    6: 2,     // ES
    7: 1,     // NES
    8: 4,     // W
    9: 3,     // NW
    10: 0,    // EW
    11: 0,    // NEW
    12: 2,    // SW
    13: 1,    // NSW
    14: 1,    // ESW
    15: 2     // NESW
  };

  const MASK_TO_COL = {
    0: 9,
    1: 6,     // N
    2: 3,     // E
    3: 3,     // NE
    4: 0,     // S
    5: 3,     // NS
    6: 3,     // ES
    7: 3,     // NES
    8: 6,     // W
    9: 0,     // NW
    10: 0,    // EW
    11: 6,    // NEW
    12: 6,    // SW
    13: 6,    // NSW
    14: 0,    // ESW
    15: 0     // NESW
  };

  function getOffset(block) {
    const hp = typeof block.hp === "number" ? block.hp : 2;

    if (!block.breakable) return 0;       // unbreakable column (unbreakable variants)
    if (hp >= 2) return 1;          // breakable, 2 hp column
    if (hp === 1) return 2;         // breakable, 1 hp column
    // if hp <= 0 we prefer to render special 0hp tiles (handled separately)
    return 2;
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

    let row = MASK_TO_ROW[mask];
    let col = MASK_TO_COL[mask];

    if (mask === 0) {
      row += getOffset(block);
    } else {
      col += getOffset(block);
    }

    return {
      x: col * ATLAS_TILE,
      y: row * ATLAS_TILE,
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
    blockSheet.current = new Image();
    blockSheet.current.src = "assets/maps/common/Wallpattern.webp";

    blockSheet.current.onload = () => {
      const ctx = blockCanvasRef.current.getContext("2d");
      renderBlocks(ctx, blockSheet.current, gameState.map.blocks, tileSize, boardWidth, boardHeight);
    };
  }, [gameState.map, tileSize]);

  useEffect(() => {
    if (!blockCanvasRef.current || !blockSheet.current) return;
    const ctx = blockCanvasRef.current.getContext("2d");
    renderBlocks(ctx, blockSheet.current, gameState.map.blocks, tileSize, boardWidth, boardHeight);
  }, [gameState.map.blocks]);

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
      ref=${canvasRef}
      width=${tileSize * boardWidth}
      height=${tileSize * boardHeight}
      style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
    <div class="units">${[...gameState.teams[1], ...gameState.teams[0]]
      .filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)
      .map(unit => {
        let position = unit.pos;
        if (isAnimating) {
          if (unitPositions) {
            position = unitPositions[unit.id];
          }
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
    ${isDuel && html`<div class="corner" style=${getCornerStyle(0, 0)}>
      <${ActionTracker} tileSize=${tileSize} gameState=${gameState} />
    </div>`}
    ${isDuel && html`<div class="corner" style=${getCornerStyle(6, 8)}><${Timer} tileSize=${tileSize} /></div>`}
  </div>
  `;
}

export default Board;
