import { html, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";

const BoardLayerTiles = ({ highlightedTiles, boardWidth, boardHeight, tileSize }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    highlightedTiles.forEach(tile => {
      if (tile.colour === "transparent") return;
      ctx.fillStyle = tile.colour;
      ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
    });
  }, [highlightedTiles, tileSize, boardWidth, boardHeight]);

  return html`
  <canvas
    ref=${canvasRef}
    width=${tileSize * boardWidth}
    height=${tileSize * boardHeight}
    style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
  `;
}

export default BoardLayerTiles;
