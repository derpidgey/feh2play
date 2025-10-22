import { useState, useRef, useEffect } from "https://esm.sh/htm/preact/standalone";
import Engine from "../engine.js";
import { deepClone } from "../utils.js";

const engine = Engine();

const useGameLogic = (initialGameState, playingAs) => {
  const workerRef = useRef(null);
  const [gameState, setGameState] = useState(initialGameState);

  useEffect(() => {
    workerRef.current = new Worker("js/aiWorker.js", { type: "module" });
    return () => {
      workerRef.current.terminate();
    }
  }, []);

  const executeAction = action => {
    if (!engine.isValidAction(gameState, action)) {
      console.warn("Invalid Action:", action);
      return;
    }
    const newGameState = deepClone(gameState);
    const sequence = engine.executeAction(newGameState, action);
    const updateGameState = () => {
      setGameState(newGameState);
    }
    return { sequence, updateGameState };
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
    return new Promise((resolve) => {
      const worker = workerRef.current;
      worker.onmessage = (e) => {
        resolve(e.data.best);
      };
      worker.postMessage({ gameState, depth: 4 });
    });
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
