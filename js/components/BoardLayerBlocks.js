import { html, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";

const blockSheet = new Image();
blockSheet.src = "assets/maps/common/Wallpattern.webp";

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

const getOffset = block => {
  if (!block || !block.breakable) return 0;
  if (block.hp >= 2) return 1;
  if (block.hp === 1) return 2;
  console.warn("Invalid block", block);
}

const BoardLayerBlocks = ({ map, tileSize }) => {
  const canvasRef = useRef(null);

  const boardWidth = map.terrain[0].length;
  const boardHeight = map.terrain.length;

  const blockMap = new Map();
  for (const block of map.blocks) blockMap.set(`${block.x},${block.y}`, block);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, tileSize * boardWidth, tileSize * boardHeight);

    for (const block of map.blocks) {
      const neighbors = getNeighborMask(block, map.blocks);
      const { x, y, w, h } = getBlockSprite(block, neighbors);
      ctx.drawImage(blockSheet, x, y, w, h, block.x * tileSize, block.y * tileSize, tileSize, tileSize);
    }
  }, [map.blocks, tileSize]);

  const getBlockSprite = (block, mask) => {
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

  const getNeighborMask = block => {
    let mask = 0;

    const north = blockMap.get(`${block.x},${block.y - 1}`);
    if (north) mask |= BIT_N;
    const east = blockMap.get(`${block.x + 1},${block.y}`);
    if (east) mask |= BIT_E;
    const south = blockMap.get(`${block.x},${block.y + 1}`);
    if (south) mask |= BIT_S;
    const west = blockMap.get(`${block.x - 1},${block.y}`);
    if (west) mask |= BIT_W;

    return mask;
  }

  return html`
  <canvas
    ref=${canvasRef}
    width=${tileSize * boardWidth}
    height=${tileSize * boardHeight}
    style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
  `;
}

export default BoardLayerBlocks;
