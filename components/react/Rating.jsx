'use client';
// components/react/Rating.jsx
// Star rating with no MUI dependency: plain buttons styled by
// ui/components/rating.css, so it works in any React app. MUI apps use MUI's
// own <Rating>, which adapters/mui-theme.js colours to match.
//
// Behaves as a radiogroup: Tab reaches the chosen star (or the first),
// arrow keys move and choose, Home/End jump. Hovering previews what a click
// would choose. Clicking the chosen star again, or Space/Enter on it, clears.
import React, { useRef, useState } from 'react';

/**
 * Rating - choose 1..max stars, or none.
 *
 * @param {Object} props
 * @param {number} props.value - Stars chosen; 0 means not rated
 * @param {function} props.onChange - Called with the new value; 0 when cleared
 * @param {string} props.label - Accessible name for the group, e.g. "Fit"
 * @param {number} [props.max=3] - Number of stars
 * @param {string[]} [props.itemLabels] - A name per star, e.g. ['Low','Medium','High']
 * @param {boolean} [props.disabled=false] - Locks the stars, e.g. while saving
 * @param {string} [props.className] - Extra classes on the group
 *
 * @example
 * <Rating label="Fit" value={stars} onChange={setStars}
 *   itemLabels={['Low', 'Medium', 'High']} />
 */
export function Rating({
  value = 0,
  onChange,
  label,
  max = 3,
  itemLabels,
  disabled = false,
  className = '',
  ...otherProps
}) {
  const [hover, setHover] = useState(0);
  const refs = useRef([]);

  const lit = hover || value;
  const nameOf = (n) => itemLabels?.[n - 1] ?? `${n} of ${max}`;
  // Only one star is in the tab order: the chosen one, or the first.
  const tabStop = value || 1;

  const choose = (n) => {
    if (disabled) return;
    onChange?.(n === value ? 0 : n);
  };

  const move = (n) => {
    const next = Math.min(max, Math.max(1, n));
    if (next !== value) onChange?.(next);
    refs.current[next - 1]?.focus();
  };

  const onKeyDown = (e, n) => {
    if (disabled) return;
    const keys = {
      ArrowRight: () => move(n + 1), ArrowUp: () => move(n + 1),
      ArrowLeft: () => move(n - 1), ArrowDown: () => move(n - 1),
      Home: () => move(1), End: () => move(max),
    };
    if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
  };

  return (
    <span
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={`rating ${className}`.trim()}
      onMouseLeave={() => setHover(0)}
      {...otherProps}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const on = n <= lit;
        const chosen = n === value;
        return (
          <button
            key={n}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={chosen}
            aria-label={itemLabels ? `${nameOf(n)} (${n} of ${max})` : nameOf(n)}
            title={chosen ? `${nameOf(n)}. Click again to clear` : nameOf(n)}
            tabIndex={n === tabStop ? 0 : -1}
            className={on ? 'rating__star rating__star--on' : 'rating__star'}
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onClick={() => choose(n)}
            onKeyDown={(e) => onKeyDown(e, n)}
          >
            <span aria-hidden="true">{on ? '★' : '☆'}</span>
          </button>
        );
      })}
    </span>
  );
}

export default Rating;
