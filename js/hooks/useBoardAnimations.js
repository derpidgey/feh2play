import { useState, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";

const FPS = 1000 / 30;

const initPositions = gameState => {
  return [...gameState.teams[0], ...gameState.teams[1]].reduce((acc, unit) => {
    acc[unit.id] = { ...unit.pos };
    return acc;
  }, {});
}

const useBoardAnimations = (gameState, animationSequence, onAnimationComplete) => {
  const unitPositionsRef = useRef(initPositions(gameState));
  const [unitPositions, setUnitPositions] = useState(unitPositionsRef.current);
  const [phaseOverlay, setPhaseOverlay] = useState(false);
  const [turnOverlay, setTurnOverlay] = useState(false);

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
    unitPositionsRef.current = initPositions(gameState);
    setUnitPositions({ ...unitPositionsRef.current });
    const allAnimations = animationSequence.flat();
    const turnChanges = allAnimations.filter(animation => animation.type === "currentTurn");
    const startTurn = allAnimations.filter(animation => animation.type === "startTurn");
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

  return { unitPositions, isAnimating: animationSequence.length > 0, phaseOverlay, turnOverlay };
}

export default useBoardAnimations;
