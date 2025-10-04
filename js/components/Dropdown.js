import { html, useState, useEffect, useRef } from "https://esm.sh/htm/preact/standalone";

const Dropdown = ({ options = [], placeholder = "Select an option", onSelect, defaultSelected = null }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultSelected);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  const handleSelect = (value) => {
    setSelected(value);
    setOpen(false);
    setQuery("");
    setHighlightedIndex(0);
    if (onSelect) onSelect(value);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === 0 ? filteredOptions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {

        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredOptions, highlightedIndex]);

  return html`
    <div ref=${containerRef} style=${{ position: "relative", width: "250px" }}>
      <div
      onClick=${() => setOpen(!open)}
      style=${{
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "8px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      backgroundColor: "#fff"
    }}>
        <span>${selected || placeholder}</span>
        <span style=${{ fontSize: "12px", opacity: 0.6 }}>▼</span>
      </div>
      ${open && html`
        <div
        style=${{
        position: "absolute",
        top: "110%",
        left: 0,
        right: 0,
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        maxHeight: "250px",
        overflowY: "auto",
        zIndex: 1000
      }}>
        <input
        ref=${inputRef}
        type="text"
        placeholder="Search..."
        value=${query}
        onInput=${(e) => setQuery(e.target.value)}
        style=${{
        width: "calc(100% - 16px)",
        margin: "8px",
        padding: "6px 8px",
        border: "1px solid #ddd",
        borderRadius: "4px"
      }}/>
        ${filteredOptions.length === 0
        ? html`<div style=${{ padding: "8px", fontSize: "14px", color: "#666" }}>No results found.</div>`
        : filteredOptions.map((option, index) =>
          html`<div
        key=${option}
        onClick=${() => handleSelect(option)}
        onMouseEnter=${() => setHighlightedIndex(index)}
        style=${{
              padding: "8px 12px",
              cursor: "pointer",
              backgroundColor:
                highlightedIndex === index
                  ? "#e6f0ff"
                  : selected === option
                    ? "#f0f0f0"
                    : "transparent"
            }}>
        ${option}
        </div>`)}
      </div>`}
    </div>
  `;
}

export default Dropdown;
