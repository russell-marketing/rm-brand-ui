// components/react/MultiSelect.d.ts — types for MultiSelect.jsx, so TypeScript
// apps can import it without a declaration of their own.
import type { JSX } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
  /** How many items have this value, shown at the end of its row. */
  count?: number;
}

export interface MultiSelectProps {
  /** The field's visible label, e.g. "Category". */
  label: string;
  /** The list, in the order shown. */
  options: MultiSelectOption[];
  /** The values chosen; every option's value means all. */
  value: string[];
  /** Called with the new values, in the options' order. */
  onChange: (value: string[]) => void;
  /** Extra classes on the wrapper. */
  className?: string;
}

export function MultiSelect(props: MultiSelectProps): JSX.Element;
export default MultiSelect;
