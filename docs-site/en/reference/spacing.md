# Spacing tokens

Padding and margins inside components are never written as pixel values; they go through `@space-*`. Those variables compile into the CSS variables `--space-*`, so one scale serves both Less and runtime code.

## The scale

| Token        | Value | Typical use                   |
| ------------ | ----- | ----------------------------- |
| `@space-0-5` | 2px   | Nudging an icon against text  |
| `@space-1`   | 4px   | Tag padding, dense lists      |
| `@space-1-5` | 6px   | Status dots, tight controls   |
| `@space-2`   | 8px   | Minimum gap between controls  |
| `@space-2-5` | 10px  | Button groups                 |
| `@space-3`   | 12px  | Gaps between blocks in a card |
| `@space-4`   | 16px  | Card padding, group spacing   |
| `@space-5`   | 20px  | Block padding                 |
| `@space-6`   | 24px  | Block spacing                 |
| `@space-8`   | 32px  | Page-level sections           |
| `@space-10`  | 40px  | Large sections                |
| `@space-12`  | 48px  | Page top and bottom padding   |

The scale is a ratio-like ladder starting at 2px, not a 4px arithmetic progression. Six is needed between four and eight, ten between eight and twelve; without those steps people write 5px, 7px and 11px by hand, and a year later a page carries twenty-odd different gaps.

## Values off the scale snap to it

Fourteen, eighteen and thirty used to be scattered around; they all snap to the neighbouring 12, 16 or 32:

| Old value | Snaps to     | Reason                  |
| --------- | ------------ | ----------------------- |
| 14px      | 12px or 16px | Nearest step by meaning |
| 18px      | 16px         | Form row spacing        |
| 30px      | 32px         | Block spacing           |

Two negative offsets keep their original values: `-6px` on the password recovery card and `-20px` on the knowledge center drawer. A negative offset means "overlap the layer below", which is not part of the spacing scale.

## The guard

```bash
npm run spacing:check
```

The script scans every `.vue` and `.less` file and fails on bare pixel values inside `padding`, `margin` and `gap`. It currently covers 148 `.vue` files and 558 spacing declarations, all on tokens.

## When tokens are not required

Three cases: non-length values such as `0` and `100%`; hairline offsets such as `-1px`; and a 1px border correction that genuinely needs exact alignment. Nothing else is exempt.

## Relation to breakpoints

Spacing does not scale with breakpoints. On a narrow screen the columns drop and padding goes from 16 to 12, while the scale itself stays put — one scale across widths is what keeps page density predictable.
