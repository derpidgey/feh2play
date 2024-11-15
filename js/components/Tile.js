import { html } from "https://esm.sh/htm/preact/standalone";

const Tile = ({ size, colour = "transparent"}) => {
  return html`
  <div class="tile" style="width: ${size}px; height: ${size}px; background-color: ${colour}"></div>
  `;
};

export default Tile;
