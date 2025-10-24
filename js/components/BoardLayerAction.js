import { html, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";

const BoardLayerAction = ({ potentialAction, boardWidth, boardHeight, tileSize }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!potentialAction.from) return;
    const path = potentialAction.to.path ?? [];
    ctx.strokeStyle = "rgba(173, 216, 230, 0.5)";
    ctx.lineWidth = tileSize / 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    if (path.length === 0) {
      ctx.fillStyle = ctx.strokeStyle;
      ctx.arc(potentialAction.from.x * tileSize + tileSize / 2, potentialAction.from.y * tileSize + tileSize / 2, tileSize / 6, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.moveTo(path[0].x * tileSize + tileSize / 2, path[0].y * tileSize + tileSize / 2);
      path.forEach(({ x, y }) => ctx.lineTo(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2));
      ctx.stroke();
    }
  }, [potentialAction, boardWidth, boardHeight, tileSize]);

  return html`
  <canvas
    ref=${canvasRef}
    width=${tileSize * boardWidth}
    height=${tileSize * boardHeight}
    style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
  `;
}

export default BoardLayerAction;
