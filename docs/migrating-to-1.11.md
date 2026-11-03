# Moving an app to 1.11

1.11 adds a dropdown that holds several choices. **Nothing changes for an app
until it uses it**, apart from the one change under "What looks different".
Apps on `#semver:^1.10.0` get 1.11 with
`npm update @russell-marketing/brand-ui`; then raise the floor to `^1.11.0`.

## New

### `.multi-select`: choose several from a list

A list too long for a row of checkboxes. It looks like a `.select` and opens a
`.popover` of checkboxes, so a filter bar stays one line however long the list
is. The trigger says what's chosen: All, None, the one name, or "3 of 24".

```jsx
import { MultiSelect } from '@russell-marketing/brand-ui/react/MultiSelect';

<div className="filter-bar">
  <MultiSelect label="Category" value={chosen} onChange={setChosen}
    options={[{ value: 'audio', label: 'Audio', count: 22 }]} />
  <div className="filter-bar__actions"><button className="btn">Clear</button></div>
</div>
```

`value` lists what's chosen, so "everything" is every option's value. The
panel has All and None at its top, so picking one item out of 24 takes two
clicks, not 23. Without React, copy the markup at the top of
`ui/components/multi-select.css` and open and close it yourself. MUI: `<Select
multiple>` with a `<Checkbox>` in each `<MenuItem>`.

| Before | After |
|---|---|
| A `.filter-bar__group` whose checkboxes run past one row | `.multi-select` |
| A row of local dropdown-with-checkboxes markup | `.multi-select` |

### Rule 14 covers charts and boards

The exception for "a long table whose header stays in view" now reads
"something wide and long whose headings stay in view": a table, a chart or a
board of columns. One box, `max-height: 80dvh`, scrolling both ways, with
`role="region"`, `tabindex="0"` and an `aria-label`. A pinned heading needs a
solid background matching what shows behind it: inside `.surface--unmatched`
that's `--bg-page`, not `--bg-surface`.

## What looks different

- **A visible `<legend>` in `.filter-bar__group`** now looks like a field's
  `<label>`: semibold, with the same gap. It looked like one of its own
  options. A `.visually-hidden` legend is unchanged.
