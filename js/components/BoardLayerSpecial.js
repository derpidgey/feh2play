import { html, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";
import Engine from "../engine.js";
import { SPECIAL_TYPE } from "../data/definitions.js";

const engine = Engine();

const specialIcon = new Image();
specialIcon.src = "assets/icons/aoeIcon.png";

const BoardLayerSpecial = ({ activeUnit, potentialAction, boardWidth, boardHeight, tileSize }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!potentialAction.from) return;
    if (potentialAction.type === "attack" && activeUnit.special.current === 0) {
      const specialInfo = engine.getSpecialInfo(activeUnit);
      if (specialInfo.specialType === SPECIAL_TYPE.AOE) {
        specialInfo.aoe.shape.forEach(({ x, y }) => {
          const tileX = (potentialAction.target.x + x) * tileSize;
          const tileY = (potentialAction.target.y + y) * tileSize;
          const iconSize = tileSize * 0.8;
          const offset = (tileSize - iconSize) / 2;
          ctx.drawImage(
            specialIcon,
            tileX + offset,
            tileY + offset,
            iconSize,
            iconSize
          );
        });
      }
    }
  }, [activeUnit, potentialAction, boardWidth, boardHeight, tileSize]);

  return html`
  <canvas
    ref=${canvasRef}
    width=${tileSize * boardWidth}
    height=${tileSize * boardHeight}
    style=${{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />
  `;
}

export default BoardLayerSpecial;
