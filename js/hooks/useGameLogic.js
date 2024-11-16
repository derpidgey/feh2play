import { useState, useEffect } from "https://esm.sh/htm/preact/standalone";
import Engine from "../engine.js";
import { deepClone } from "../utils.js";

const engine = Engine();

const useGameLogic = (initialGameState, playingAs) => {
  const [gameState, setGameState] = useState(initialGameState);

  const executeAction = action => {
    if (!engine.isValidAction(gameState, action)) {
      console.warn("Invalid Action:", action);
      return;
    }
    const newGameState = deepClone(gameState);
    const sequence = engine.executeAction(newGameState, action);
    const onComplete = () => {
      setGameState(newGameState);
    }
    return { sequence, onComplete };
  }

  const endTurn = () => {
    const newGameState = deepClone(gameState);
    engine.endTurn(newGameState);
    setGameState(newGameState);
  }

  const endSwapPhase = () => {
    const newGameState = deepClone(gameState);
    engine.endSwapPhase(newGameState);
    setGameState(newGameState);
  }

  const swapStartingPositions = (posA, posB) => {
    const newGameState = deepClone(gameState);
    engine.swapStartingPositions(newGameState, posA, posB);
    setGameState(newGameState);
  }

  if (gameState.mode === "duel") {
    useEffect(() => {
      const MIN_DELAY = 500;
      if (gameState.currentTurn !== playingAs && !gameState.isSwapPhase && !gameState.gameOver) {
        const startTime = Date.now();
        const info = engine.search(gameState, 3);
        const newGameState = deepClone(gameState);
        engine.executeAction(newGameState, info.best);
        const timeTaken = Date.now() - startTime;
        const delay = Math.max(MIN_DELAY - timeTaken, 0);
        const timeout = setTimeout(() => setGameState(newGameState), delay);
        return () => clearTimeout(timeout);
      }
    }, [
      gameState.currentTurn,
      gameState.turnCount,
      gameState.isSwapPhase,
      gameState.duelState[0].actionsRemaining,
      gameState.duelState[1].actionsRemaining,
      playingAs,
    ]);
  }

  return {
    gameState,
    executeAction,
    endTurn,
    endSwapPhase,
    swapStartingPositions
  }
}

export default useGameLogic;
