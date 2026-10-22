// components/react/SliderWithLabel.jsx
// Reusable slider component with integrated label-slider grouping
// Works with MUI's Slider component

import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

/**
 * SliderWithLabel - A slider component with proper label-slider grouping
 *
 * This component ensures the label and slider are grouped as a single unit,
 * with proper spacing defined by RM brand tokens.
 *
 * @param {Object} props
 * @param {string} props.label - The label text for the slider
 * @param {number|number[]} props.value - The slider value (single number or range array)
 * @param {function} props.onChange - Callback function when slider value changes
 * @param {number} props.min - Minimum slider value
 * @param {number} props.max - Maximum slider value
 * @param {number} [props.step=1] - Step increment for the slider
 * @param {boolean} [props.valueLabelDisplay='auto'] - When to show value label ('auto', 'on', 'off')
 * @param {function} [props.valueLabelFormat] - Custom function to format the value label
 * @param {Object} [props.sliderProps] - Additional props to pass to the MUI Slider component
 * @param {Object} [props.sx] - Additional sx styles for the container
 *
 * @example
 * ```jsx
 * <SliderWithLabel
 *   label="Amount Raised"
 *   value={amountRange}
 *   onChange={(e, newVal) => setAmountRange(newVal)}
 *   min={0}
 *   max={10000000}
 *   step={50000}
 *   valueLabelDisplay="auto"
 * />
 * ```
 */
export function SliderWithLabel({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  valueLabelDisplay = 'auto',
  valueLabelFormat,
  sliderProps = {},
  sx = {},
  ...otherProps
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--slider-label-gap, 0.5rem)',
        ...sx,
      }}
      {...otherProps}
    >
      <Typography
        variant="body2"
        component="label"
        sx={{
          fontWeight: 600,
          color: 'var(--text-primary, #18191E)',
        }}
      >
        {label}
      </Typography>
      {/* The theme insets the slider by half a thumb and makes it a block,
          so its end handles stay inside this box (see MuiSlider in
          adapters/mui-theme.js). */}
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={valueLabelFormat}
        {...sliderProps}
      />
    </Box>
  );
}

export default SliderWithLabel;
