'use client';
// components/react/MultiSelect.jsx
// A dropdown that holds several choices, styled by
// ui/components/multi-select.css, so it works in any React app. MUI apps use
// <Select multiple> with a <Checkbox> in each <MenuItem>.
//
// The trigger opens a panel of real checkboxes, so Tab, Space and screen
// readers work as they do anywhere. The panel stays open while people tick;
// Escape, a click outside it or tabbing out of it closes it.
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect warns when rendered on a server, where there's nothing to measure.
const useMeasure = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * MultiSelect - choose any number of options from a list.
 *
 * @param {Object} props
 * @param {string} props.label - The field's visible label, e.g. "Category"
 * @param {{value: string, label: string, count?: number}[]} props.options - The list, in the order shown
 * @param {string[]} props.value - The values chosen; every option's value means all
 * @param {function} props.onChange - Called with the new values, in the options' order
 * @param {string} [props.className] - Extra classes on the wrapper
 *
 * @example
 * <MultiSelect label="Source" value={sources} onChange={setSources}
 *   options={[{ value: 'kickstarter', label: 'Kickstarter', count: 583 }]} />
 */
export function MultiSelect({ label, options, value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const panel = useRef(null);
  const id = useId();

  const chosen = options.filter((o) => value.includes(o.value));
  const summary = chosen.length === options.length ? 'All'
    : chosen.length === 0 ? 'None'
    : chosen.length === 1 ? chosen[0].label
    : `${chosen.length} of ${options.length}`;

  // Hang from the right edge when the panel would run off the screen.
  useMeasure(() => {
    if (!open) return;
    const left = root.current.getBoundingClientRect().left;
    setAtEnd(left + panel.current.offsetWidth > document.documentElement.clientWidth);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => { if (!root.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  const toggle = (v) => {
    const next = value.includes(v) ? value.filter((x) => x !== v) : [...value, v];
    onChange(options.map((o) => o.value).filter((x) => next.includes(x)));
  };

  return (
    <div
      ref={root}
      className={`multi-select popover-anchor ${className}`.trim()}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          setOpen(false);
          trigger.current.focus();
        }
      }}
      onBlur={(e) => { if (e.relatedTarget && !root.current.contains(e.relatedTarget)) setOpen(false); }}
    >
      <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        className="select multi-select__trigger"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-labelledby={`${id}-label ${id}-trigger`}
        onClick={() => setOpen(!open)}
      >
        <span className="multi-select__value">{summary}</span>
      </button>
      <div
        ref={panel}
        id={`${id}-panel`}
        className={`popover multi-select__panel${atEnd ? ' popover--end' : ''}`}
        role="group"
        aria-labelledby={`${id}-label`}
        hidden={!open}
      >
        <div className="multi-select__all">
          <button type="button" className="btn btn--text btn--sm" onClick={() => onChange(options.map((o) => o.value))}>All</button>
          <button type="button" className="btn btn--text btn--sm" onClick={() => onChange([])}>None</button>
        </div>
        {options.map((o) => (
          <label key={o.value} className="checkbox-field multi-select__option">
            <input type="checkbox" className="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
            {o.label}
            {o.count !== undefined && <span className="multi-select__count">{o.count}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

export default MultiSelect;
