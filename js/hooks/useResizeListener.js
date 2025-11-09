import { useLayoutEffect } from "https://esm.sh/htm/preact/standalone";
import { debounce } from "../utils.js";

const useResizeListener = (callback, delay = 0) => {
  const debouncedCallback = debounce(callback, delay);
  useLayoutEffect(() => {
    callback();
    const observer = new ResizeObserver(debouncedCallback);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);
}

export default useResizeListener;
