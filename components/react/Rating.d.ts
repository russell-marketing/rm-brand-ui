// components/react/Rating.d.ts — types for Rating.jsx, so TypeScript apps
// can import it without a declaration of their own.
import type { HTMLAttributes, JSX } from 'react';

export interface RatingProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  /** Stars chosen; 0 means not rated. */
  value: number;
  /** Called with the new value; 0 when cleared. */
  onChange?: (value: number) => void;
  /** Accessible name for the group, e.g. "Fit". */
  label: string;
  /** Number of stars. Default 3. */
  max?: number;
  /** A name per star, e.g. ['Low', 'Medium', 'High']. */
  itemLabels?: string[];
  /** Locks the stars, e.g. while saving. */
  disabled?: boolean;
}

export function Rating(props: RatingProps): JSX.Element;
export default Rating;
