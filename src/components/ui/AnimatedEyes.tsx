"use client";

// Pixel art 👀 brand mark — bounce + shadow + dust
// ViewBox "0 0 13 7": two 7-col eyes sharing the empty outer col — gap = 1 unit
// Left eye cols 0-6, right eye cols 6-12 (col 6 shared empty, visible gap = 1px)
// Eye shape (per eye, 7-col grid — outer cols always empty):
//   . . # # # . .   row 0  (top: x+2, width=3)
//   . # · · · # .   row 1  (sides: x+1 and x+5)
//   . # · · · # .   row 2
//   . # · @ · # .   row 3  (pupil at x+3)
//   . # · · · # .   row 4
//   . # · · · # .   row 5
//   . . # # # . .   row 6  (bottom: x+2, width=3)
// Harmonious 5-level gray palette: #383838 / #888888 / #555555 / #c8c8c8 / #e0e0e0
export function AnimatedEyes({ size = 28 }: { size?: number }) {
  const px = Math.max(1, Math.round(size / 7));

  const eyeW = 13 * px; // e.g. 52px at size=28
  const eyeH = 7 * px;  // e.g. 28px
  const shadowGap = 2 * px;
  const totalH = eyeH + shadowGap; // e.g. 36px

  const shadowW = 7 * px;
  const shadowH = px;
  const dustSize = px;

  return (
    <div
      style={{
        position: "relative",
        width: eyeW,
        height: totalH,
        display: "inline-block",
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* ── Bouncing eyes ── */}
      <div
        className="px-bounce"
        style={{ position: "absolute", top: 0, left: 0, width: eyeW, height: eyeH }}
      >
        <svg
          width={eyeW}
          height={eyeH}
          viewBox="0 0 13 7"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", imageRendering: "pixelated" }}
          shapeRendering="crispEdges"
        >
          <g className="px-blink">
            {/* ── Left eye (cols 0-6, cols 0 & 6 always empty) ── */}
            <rect x="2" y="0" width="3" height="1" fill="#383838" /> {/* top    */}
            <rect x="1" y="1" width="1" height="5" fill="#383838" /> {/* left   */}
            <rect x="5" y="1" width="1" height="5" fill="#383838" /> {/* right  */}
            <rect x="2" y="6" width="3" height="1" fill="#383838" /> {/* bottom */}
            <rect x="2" y="1" width="3" height="5" fill="#c8c8c8" /> {/* sclera */}
            <rect x="2" y="2" width="2" height="2" fill="#888888" /> {/* iris   */}
            <rect x="3" y="3" width="1" height="1" fill="#555555" /> {/* pupil  */}
            <rect x="4" y="1" width="1" height="1" fill="#e0e0e0" /> {/* shine  */}

            {/* ── Right eye (offset=6, cols 6-12, gap = col 6, visible left starts x=7) ── */}
            <rect x="8"  y="0" width="3" height="1" fill="#383838" />
            <rect x="7"  y="1" width="1" height="5" fill="#383838" />
            <rect x="11" y="1" width="1" height="5" fill="#383838" />
            <rect x="8"  y="6" width="3" height="1" fill="#383838" />
            <rect x="8"  y="1" width="3" height="5" fill="#c8c8c8" />
            <rect x="8"  y="2" width="2" height="2" fill="#888888" />
            <rect x="9"  y="3" width="1" height="1" fill="#555555" />
            <rect x="10" y="1" width="1" height="1" fill="#e0e0e0" />
          </g>
        </svg>
      </div>

      {/* ── Ground shadow ── */}
      <div
        className="px-shadow"
        style={{
          position: "absolute",
          bottom: shadowH,
          left: 3 * px,
          width: shadowW,
          height: shadowH,
          background: "#383838",
        }}
      />

      {/* ── Dust particles ── */}
      <div
        className="px-dust-l"
        style={{
          position: "absolute",
          bottom: shadowH + dustSize,
          left: dustSize,
          width: dustSize,
          height: dustSize,
          background: "#909090",
        }}
      />
      <div
        className="px-dust-r"
        style={{
          position: "absolute",
          bottom: shadowH + dustSize,
          right: dustSize,
          width: dustSize,
          height: dustSize,
          background: "#909090",
        }}
      />
    </div>
  );
}
