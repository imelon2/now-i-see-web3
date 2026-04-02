# now-i-see-web3 — Project Guide for Claude

## Brand Identity

### Brand Name
**Now I See Web3** — on-chain data analyzer

<!-- ### Brand Color System (Grayscale)

The brand uses an all-grayscale palette with no warm/cold hues.

#### Brand Text
| Role | Color | Usage |
|------|-------|-------|
| Brand name | `#ffffff` | "Now I See Web3" (white, high contrast on dark bg) |
| Subtitle | `var(--muted)` = `#8b949e` | "on-chain data analyzer" |

#### AnimatedEyes Pixel Art (5-level gray scale)
| Level | Color | Role |
|-------|-------|------|
| 1 — Dark | `#383838` | Outline, ground shadow |
| 2 — Medium-dark | `#555555` | Pupil |
| 3 — Medium | `#888888` | Iris |
| 4 — Light | `#c8c8c8` | Sclera (white of eye) |
| 5 — Near-white | `#e0e0e0` | Highlight/shine |
| Dust | `#909090` | Dust particle effect |

#### App Theme Colors (from `src/app/globals.css`)
| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#0d1117` | Page background |
| `--foreground` | `#e6edf3` | Body text |
| `--muted` | `#8b949e` | Secondary text |
| `--border` | `#30363d` | Borders |
| `--panel` | `#161b22` | Panel background |
| `--panel-header` | `#21262d` | Panel header, NavBar sidebar |
| `--accent` | `#58a6ff` | Active nav, focus rings |
| `--success` | `#3fb950` | Success states |
| `--error` | `#f85149` | Error states |
| `--warning` | `#d29922` | Warning states |

### Brand Do's and Don'ts
- **Do** use `#ffffff` or `var(--foreground)` for the brand name
- **Do** use the 5-level gray palette for pixel art elements
- **Don't** use amber/orange (`#d97706`, `#f59e0b`, `#92400e`) — removed from brand
- **Don't** add color accents to the AnimatedEyes component -->

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `src/components/ui/AnimatedEyes.tsx` | Pixel art 👀 brand animation (SVG rects + CSS keyframes) |
| `src/components/ui/NavBar.tsx` | Desktop sidebar + mobile top bar with BrandMark |
| `src/app/globals.css` | CSS variables, layout classes, px-* animation keyframes |

## Git 규칙

- 사용자가 명시적으로 `git push`를 요청하지 않는 한 절대 push를 수행하지 않는다.

### AnimatedEyes Technical Details
- viewBox: `"0 0 13 7"` — two 7-col eyes, 1-unit visible gap
- Eye shape: custom oval (outer cols always empty, sides at x+1 and x+5, top/bottom width=3 at x+2)
- Animation: `px-bounce` 0.55s, `px-shadow` 0.55s, `px-dust-l/r` 0.55s, `px-blink` 3.2s
- Scale: `px = Math.round(size / 7)`, default `size=28` → `px=4`, eyeW=52px, eyeH=28px
