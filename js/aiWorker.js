import Engine from "./engine.js";

const engine = Engine();

onmessage = (e) => {
  const { gameState, depth } = e.data;  
  const info = engine.search(gameState, depth);
  postMessage({ best: info.best, score: info.score });
};
