import { useLayoutEffect } from "https://esm.sh/htm/preact/standalone";
import { debounce } from "../utils.js";

const useResizeListener = (callback, delay = 100) => {
  const debouncedCallback = debounce(callback, delay);

  useLayoutEffect(() => {
    window.addEventListener('resize', debouncedCallback);
    return () => window.removeEventListener('resize', debouncedCallback);
  }, [debouncedCallback]);
}

export default useResizeListener;
