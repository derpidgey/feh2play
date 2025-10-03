import { html, useState } from "https://esm.sh/htm/preact/standalone";

const Dropdown = ({ options, value, onChange, placeholder = "Select..." }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectOption = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  return html`
    <div class="dropdown" style="position: relative;">
      <input
        type="text"
        placeholder=${placeholder}
        value=${value ? options.find(o => o.value === value)?.label : query}
        onInput=${e => { setQuery(e.target.value); setOpen(true); }}
        onFocus=${() => setOpen(true)}
      />
      ${open && html`
        <ul class="dropdown-list" style="position: absolute; background: white; border: 1px solid #ccc; max-height: 200px; overflow-y: auto; z-index: 10; width: 100%; padding: 0; margin: 0; list-style: none;">
          ${filteredOptions.length > 0 ? filteredOptions.map(opt => html`
            <li
              style="padding: 5px; cursor: pointer;"
              onClick=${() => selectOption(opt)}
            >${opt.label}</li>
          `) : html`<li style="padding:5px; color: #888;">No results</li>`}
        </ul>
      `}
    </div>
  `;
};

export default Dropdown;
