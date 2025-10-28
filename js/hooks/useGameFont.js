import { useState } from "https://esm.sh/htm/preact/standalone";
import useResizeListener from "./useResizeListener.js";

const useGameFont = () => {
  const [fontSize, setFontSize] = useState("16px");

  useResizeListener(() => {
    setFontSize(`${Math.min(window.innerWidth, window.innerHeight / 2) * 0.04}px`);
  }, 10);

  return { fontSize: `clamp(0.5rem, ${fontSize}, 1rem)` };
}

export default useGameFont;
