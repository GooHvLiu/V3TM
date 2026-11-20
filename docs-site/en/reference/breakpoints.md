# Breakpoints

Six widths, three device forms. Less variables serve styles, the `BREAKPOINTS` constant serves scripts, and the numbers on both sides must match one for one.

## The six steps

| Step  | Width range | Form    | Typical device           |
| ----- | ----------- | ------- | ------------------------ |
| `xs`  | < 480       | Phone   | Small phone held upright |
| `sm`  | 480 – 639   | Phone   | Large phone held upright |
| `md`  | 640 – 767   | Phone   | Phone on its side        |
| `lg`  | 768 – 1023  | Tablet  | Tablet held upright      |
| `xl`  | 1024 – 1199 | Tablet  | Tablet on its side       |
| `2xl` | ≥ 1200      | Desktop | Laptops and monitors     |

On the Less side these are `@screen-xs: 479px`, `@screen-sm: 639px`, `@screen-md: 767px`, `@screen-lg: 1023px`, `@screen-xl: 1199px`, `@screen-2xl: 1599px`, with half-open ranges: `width ≤ 767` is the phone form.

## Three forms

`xs`, `sm` and `md` belong to phone, `lg` and `xl` to tablet, `2xl` to desktop. Styles only need two aggregate variables: `@mobile-max: 767px` and `@tablet-max: 1199px`.

```ts
import { useBreakpoint } from "@/composables/use-breakpoint";

const { isMobile, isTablet, isDesktop } = useBreakpoint();
```

## How each layer changes

| Area           | Phone                                                | Tablet                        | Desktop                                 |
| -------------- | ---------------------------------------------------- | ----------------------------- | --------------------------------------- |
| Sidebar        | Drawer, opened by the hamburger                      | Collapses to an icon rail     | Always expanded                         |
| Top bar        | Hamburger, title and avatar only                     | Hides language and fullscreen | Fully expanded                          |
| Table          | Fixed columns dropped, paging keeps only page arrows | Keeps fixed columns           | Complete                                |
| Filter area    | One column, fields at full width                     | Two columns                   | Three or four on one row                |
| Settings panel | Navigation turns horizontal and scrolls              | Keeps the two panes           | Two panes, navigation pinned to the top |

## Two things not done

**No pixel-density steps.** The six steps read width only, never DPR. A 2× and a 1× screen get the same layout, with type and spacing unscaled — tuning spacing by DPR makes one design inconsistent across monitors.

**No breakpoints inside individual components.** Breakpoints are judged at the layout layer and in a handful of composites. A `@media` inside a component usually means it should become a container that adapts, rather than memorising a few widths.
