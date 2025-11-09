import { html, useState, useEffect } from "https://esm.sh/htm/preact/standalone";
import SidePanel from "./SidePanel.js";
import Board from "./Board.js";
import InfoPanel from "./InfoPanel.js";
import ActionPanel from "./ActionPanel.js";
import StatusBar from "./StatusBar.js";
import useResizeListener from "../hooks/useResizeListener.js";
import useGameLogic from "../hooks/useGameLogic.js";
import CAPTAIN_SKILLS from "../data/captainSkills.js";
import { SKILL_TYPE } from "../data/definitions.js";
import SKILLS from "../data/skills.js";
import useBootstrapTooltips from "../hooks/useBootstrapTooltips.js";
import useGameInput from "../hooks/useGameInput.js";
import useGameFont from "../hooks/useGameFont.js";
import Engine from "../engine.js";

const engine = Engine();

const Game = ({ initialGameState, playingAs = 0, onGameOver, debug = false, socket, incomingUpdate }) => {
  useBootstrapTooltips();
  const gameFont = useGameFont();
  const { gameState, executeAction, endSwapPhase, swapStartingPositions, getAiMove, handleUpdate } = useGameLogic(initialGameState, socket);
  const [swapDone, setSwapDone] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [showDangerArea, setShowDangerArea] = useState(true);
  const [animationSequence, setAnimationSequence] = useState([]);
  const [onAnimationComplete, setOnAnimationComplete] = useState(() => () => { });
  const [lastPlayedAction, setLastPlayedAction] = useState(null);

  const isAnimating = animationSequence.length > 0;
  const isDuel = gameState.mode === "duel";
  const backgroundType = isDuel ? "absolute" : "relative";

  const handleAction = action => {
    const { sequence, updateGameState } = executeAction(action);
    if (sequence.length > 0 && gameState.currentTurn === playingAs && Object.keys(potentialAction).length > 0) {
      sequence[0][0].type = "tp";
    }
    setLastPlayedAction(action);
    handleAnimations(sequence, updateGameState);
  }

  const { activeUnit, selectedUnit, potentialAction, validActions,
    lastClick, handleTileClick, deselectUnit, clearActiveUnit } = useGameInput({
      gameState,
      playingAs,
      isAnimating,
      handleAction,
      swapStartingPositions,
      swapDone,
      debug,
    });

  if (gameState.gameOver) {
    onGameOver(gameState.duelState[playingAs].result, 1000);
  }

  useResizeListener(() => {
    setIsWideScreen(window.innerWidth >= window.innerHeight * 3 / 2);
  }, 10);

  if (gameState.mode === "duel" && !socket) {
    useEffect(() => {
      const runAiTurn = async () => {
        if (gameState.currentTurn === playingAs || gameState.isSwapPhase || gameState.gameOver || isAnimating) return;
        const move = await getAiMove();
        handleAction(move);
      }
      runAiTurn();
    }, [gameState.currentTurn, gameState.isSwapPhase, playingAs, isAnimating]);

    useEffect(() => {
      const runAiTurn = async e => {
        if (debug && e.code === "KeyZ") {
          if (gameState.currentTurn !== playingAs || gameState.isSwapPhase || gameState.gameOver || isAnimating) return;
          const move = await getAiMove();
          handleAction(move);
        }
      }
      document.addEventListener("keydown", runAiTurn);
      return () => document.removeEventListener("keydown", runAiTurn);
    }, [gameState, playingAs, isAnimating]);
  }

  const onEndTurn = () => {
    const action = { type: "end turn" };
    const { sequence, updateGameState } = executeAction(action);
    setLastPlayedAction(action);
    clearActiveUnit();
    handleAnimations(sequence, updateGameState);
  }

  const onEndSwapPhase = () => {
    setSwapDone(true);
    // swap phase book moves here
    // if (playingAs === 1) {
    //   engine.swapStartingPositions(gameState, gameState.teams[0][0].pos, gameState.teams[0][2].pos);
    // }
    const { sequence, updateGameState } = endSwapPhase();
    deselectUnit();
    handleAnimations(sequence, updateGameState);
  }

  useEffect(() => {
    if (!incomingUpdate) return;
    if (engine.actionEquals(lastPlayedAction, incomingUpdate.action)) {
      setLastPlayedAction(null);
      return;
    }
    const { sequence, updateGameState } = handleUpdate(incomingUpdate);
    handleAnimations(sequence, updateGameState);
  }, [incomingUpdate]);

  const handleAnimations = (sequence, updateGameState) => {
    const mainSequence = [];
    const afterUpdateSequence = [];

    let foundTurn = false;

    for (const batch of sequence) {
      if (foundTurn) {
        afterUpdateSequence.push(batch);
      } else if (batch.some(animation => animation.type === "currentTurn" || animation.type === "startTurn")) {
        foundTurn = true;
        afterUpdateSequence.push(batch);
      } else {
        mainSequence.push(batch);
      }
    }

    const runAfterUpdateSequence = () => {
      if (afterUpdateSequence.length > 0) {
        setAnimationSequence(afterUpdateSequence);
        setOnAnimationComplete(() => () => setAnimationSequence([]));
      }
    }

    if (mainSequence.length === 0) {
      updateGameState();
      runAfterUpdateSequence();
    } else {
      setAnimationSequence(mainSequence);
      setOnAnimationComplete(() => () => {
        setAnimationSequence([]);
        updateGameState();
        runAfterUpdateSequence();
      });
    }
  }

  const surrender = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "surrender" }));
    }
    onGameOver("lose", 0);
  }

  const getCaptainInfo = unit => {
    if (!unit) return null;
    return CAPTAIN_SKILLS[unit.skills.find(skill => SKILLS[skill].type === SKILL_TYPE.CAPTAIN)];
  }
  const captainSkillsRevealed = gameState.duelState.map((duelState, i) => i === playingAs || duelState.captainSkillRevealed);
  const captainSkills = gameState.teams.map(team => getCaptainInfo(team[0]));
  const getCaptainTooltipContent = skill => `<span class="tooltip-gold">${skill.name}</span><br>${skill.description}`;

  return html`
  ${isWideScreen && html`<${SidePanel} team=${gameState.teams[0].filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)} backgroundType=${backgroundType} playingAs=${playingAs} />`}
  <div class="screen" style=${{ ...gameFont }}>
    <${InfoPanel} gameState=${gameState} unitId=${selectedUnit?.id} potentialAction=${potentialAction} playingAs=${playingAs} />
    ${gameState.mode === "duel" && html`
      <div class="score-bar">
        <div class="score blue">
          <img src="assets/maps/common/koIcon.webp" />
          <span>${gameState.duelState[0].koScore}</span>
        </div>
        <div class="score blue">
          <img src="assets/maps/common/captureIcon.webp" />
          <span>${gameState.duelState[0].captureScore}</span>
        </div>
        ${[0, 1].map(i => html`
          <div class="captain-skill">${captainSkillsRevealed[i] && captainSkills[i] &&
    html`<img src=${captainSkills[i].img}
            data-bs-toggle="tooltip"
            data-bs-html="true"
            data-bs-placement="bottom"
            data-bs-title=${getCaptainTooltipContent(captainSkills[i])} />`}
          </div>
        `)}
        <div class="score red">
          <img src="assets/maps/common/koIcon.webp" />
          <span>${gameState.duelState[1].koScore}</span>
        </div>
        <div class="score red">
          <img src="assets/maps/common/captureIcon.webp" />
          <span>${gameState.duelState[1].captureScore}</span>
        </div>
      </div>
      `}
    <${Board} gameState=${gameState} activeUnit=${activeUnit} validActions=${validActions} potentialAction=${potentialAction}
      animationSequence=${animationSequence} onAnimationComplete=${onAnimationComplete}
      handleTileClick=${handleTileClick} lastClick=${lastClick} showDangerArea=${showDangerArea} playingAs=${playingAs} swapDone=${swapDone} />
    <${ActionPanel} gameState=${gameState} onEndTurn=${onEndTurn} setShowDangerArea=${setShowDangerArea} onEndSwapPhase=${onEndSwapPhase} playingAs=${playingAs} surrender=${surrender} swapDone=${swapDone} />
    <${StatusBar} turn=${gameState.turnCount} currentTurn=${gameState.currentTurn} playingAs=${playingAs} />
  </div>
  ${isWideScreen && html`<${SidePanel} team=${gameState.teams[1].filter(unit => !gameState.isSwapPhase || !isDuel || unit.team === playingAs)} backgroundType=${backgroundType} playingAs=${playingAs} />`}
  `;
}

export default Game;
