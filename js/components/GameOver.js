import { html } from "https://esm.sh/htm/preact/standalone";

const GameOver = ({ gameResult, btnClick, btnText }) => {
  return html`
    <div class="screen d-flex justify-content-center align-items-center">
      <div class="p-3 text-center">
        <h2>Game Over</h2>
        <p class="fs-5">${gameResult}</p>
        <button type="button" class="btn btn-primary btn-lg" onClick=${btnClick}>${btnText}</button>
      </div>
    </div>
  `;
}

export default GameOver
