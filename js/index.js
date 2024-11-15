import { html, render } from "https://esm.sh/htm/preact/standalone";
import App from "./components/App.js";

render(html`<${App} />`, document.body);
