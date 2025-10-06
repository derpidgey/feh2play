import { useState } from "https://esm.sh/htm/preact/standalone";
import Engine from "../engine.js";
import { deepClone } from "../utils.js";

const engine = Engine();

const useGameLogic = (initialGameState) => {
  const [gameState, setGameState] = useState(initialGameState);

  const executeAction = action => {
    if (!engine.isValidAction(gameState, action)) {
      console.warn("Invalid Action:", action);
      return;
    }
    const newGameState = deepClone(gameState);
    const sequence = engine.executeAction(newGameState, action) ?? [];
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

  const getAiMove = () => {
    const info = engine.search(gameState, 5);
    return info.best;
  }

  return {
    gameState,
    executeAction,
    endTurn,
    endSwapPhase,
    swapStartingPositions,
    getAiMove
  }
}

export default useGameLogic;
