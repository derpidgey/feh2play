import { useEffect } from "https://esm.sh/htm/preact/standalone";

const useBootstrapTooltips = () => {
  useEffect(() => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      if (el._tooltip) el._tooltip.dispose();
      el._tooltip = new bootstrap.Tooltip(el, { html: true });
    });
  });
}

export default useBootstrapTooltips;
