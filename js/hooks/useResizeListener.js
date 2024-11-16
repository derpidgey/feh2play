import { useLayoutEffect } from "https://esm.sh/htm/preact/standalone";
import { debounce } from "../utils.js";

const useResizeListener = (callback, delay = 0) => {
  const debouncedCallback = debounce(callback, delay);
  useLayoutEffect(() => {
    callback();
    window.addEventListener('resize', debouncedCallback);
    return () => window.removeEventListener('resize', debouncedCallback);
  }, []);
}

export default useResizeListener;
