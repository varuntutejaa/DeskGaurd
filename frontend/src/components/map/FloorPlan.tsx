import {
  BUILDING,
  ROOMS,
  SEAT_BLOCKS,
  shelvesFor,
  communalTablesForBlock,
  type RoomDef,
} from "@/features/seats/geometry";

/* ─────────────────────────────────────────────────────────────────────────────
   Premium palette
───────────────────────────────────────────────────────────────────────────── */
const C = {
  // Exterior
  exterior:        "#D8E4DE",
  exteriorShadow:  "#CAD6CC",

  // Building shell
  floor:           "#F8FAF8",
  wall:            "#68897C",
  wallLight:       "#8AA89B",

  // Zone backgrounds
  floorFoyer:      "#F2F6F3",
  floorOpen:       "#EBF6EF",
  floorShelf:      "#FBF8EE",
  floorCubicle:    "#EEF1FA",
  floorDiscussion: "#E8F5EF",

  // Zone accent strokes
  openBorder:      "#BBDCC8",
  shelfBorder:     "#D8C9A4",
  cubBorder:       "#BECCDF",
  discBorder:      "#8ECFB2",

  // Aisles
  aisle:           "#E4ECE6",
  aisleLine:       "#CED8D0",

  // Furniture
  tableTop:        "#E2EBE5",
  tableStroke:     "#C4D2C8",
  chairFill:       "#F5F9F6",

  // Books
  shelf:           "#C9B898",
  shelfStroke:     "#A89270",
  shelfEdge:       "#8A7454",

  // Glass rooms
  glassFill:       "rgba(170,230,205,0.20)",
  glassStroke:     "#52B892",
  glassDoor:       "rgba(82,184,146,0.18)",
  glassGlint:      "rgba(255,255,255,0.60)",

  // Reception
  recepFill:       "hsl(158 36% 91%)",
  recepGrad:       "hsl(158 42% 94%)",
  recepStroke:     "hsl(158 48% 46%)",
  recepText:       "hsl(158 58% 22%)",
  recepAccent:     "hsl(158 48% 40%)",

  // Windows
  windowFill:      "#D2E8F4",
  windowFrame:     "#6A94B0",
  windowGlass:     "#E4F2FA",

  // Labels
  labelStrong:     "#1A2E26",
  labelMed:        "#3E5A50",
  labelMuted:      "#7A9288",
  labelGlass:      "#1A5240",
  labelCubicle:    "#28385A",
  labelShelf:      "#52401E",
  labelFoyer:      "#2A3E36",
};

const BOOK_COLORS = [
  "#C56B4A","#5888A2","#C8A03C","#6AAA72",
  "#9470B8","#D45A5A","#5AACAC","#B87840",
  "#E07060","#4A82C0","#D4A844","#72B67C",
];

/* ─────────────────────────────────────────────────────────────────────────────
   SVG Defs — gradients & filters
───────────────────────────────────────────────────────────────────────────── */
function Defs() {
  return (
    <defs>
      {/* Soft drop shadow filter */}
      <filter id="fp-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.10" />
      </filter>
      <filter id="fp-shadow-sm" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
      </filter>

      {/* Reception desk gradient */}
      <linearGradient id="recep-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.recepGrad} />
        <stop offset="100%" stopColor={C.recepFill} />
      </linearGradient>

      {/* Shelf wood gradient */}
      <linearGradient id="shelf-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4C0A0" />
        <stop offset="100%" stopColor={C.shelf} />
      </linearGradient>

      {/* Table top gradient */}
      <linearGradient id="table-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ECF2EE" />
        <stop offset="100%" stopColor={C.tableTop} />
      </linearGradient>

      {/* Glass room gradient */}
      <linearGradient id="glass-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(200,245,225,0.30)" />
        <stop offset="100%" stopColor="rgba(160,220,195,0.18)" />
      </linearGradient>

      {/* Open zone gradient */}
      <linearGradient id="open-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F0F9F4" />
        <stop offset="100%" stopColor="#E5F4EA" />
      </linearGradient>

      {/* Cubicle zone gradient */}
      <linearGradient id="cub-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F2F5FC" />
        <stop offset="100%" stopColor="#E8EDF7" />
      </linearGradient>

      {/* Pulse animation glow */}
      <radialGradient id="pulse-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(158 64% 40%)" stopOpacity="0.5" />
        <stop offset="100%" stopColor="hsl(158 64% 40%)" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Zone label — large, premium card style
───────────────────────────────────────────────────────────────────────────── */
function ZoneLabel({
  cx, cy, text, sub,
  titleColor = C.labelStrong,
  borderColor = "rgba(0,0,0,0.09)",
  bgColor = "rgba(255,255,255,0.88)",
}: {
  cx: number; cy: number;
  text: string; sub?: string;
  titleColor?: string; borderColor?: string; bgColor?: string;
}) {
  const w  = Math.max(text.length * 7.8 + 36, 148);
  const h  = sub ? 40 : 26;
  return (
    <g>
      {/* shadow */}
      <rect x={cx - w/2 + 1} y={cy - h/2 + 2} width={w} height={h}
        rx={9} fill="rgba(0,0,0,0.05)" />
      {/* card */}
      <rect x={cx - w/2} y={cy - h/2} width={w} height={h}
        rx={9} fill={bgColor} stroke={borderColor} strokeWidth={1.25} />
      {/* zone name */}
      <text x={cx} y={cy + (sub ? -5 : 6)} textAnchor="middle"
        fontSize={11.5} fontWeight={800} fill={titleColor} letterSpacing="0.07em"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {text}
      </text>
      {sub && (
        <text x={cx} y={cy + 13} textAnchor="middle"
          fontSize={8.5} fontWeight={500} fill={C.labelMuted} letterSpacing="0.03em">
          {sub}
        </text>
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Bookshelves — clean architectural shelving
───────────────────────────────────────────────────────────────────────────── */
function Shelf({ rect, idx }: { rect: { x: number; y: number; w: number; h: number }; idx: number }) {
  const isH   = rect.w > rect.h;
  const spine  = isH ? rect.h - 3 : rect.w - 3;
  const span   = isH ? rect.w : rect.h;
  const step   = 10;
  const count  = Math.max(1, Math.floor(span / step));
  return (
    <g>
      {/* shadow */}
      <rect x={rect.x + (isH ? 0 : 2)} y={rect.y + (isH ? 2 : 0)}
        width={rect.w} height={rect.h} rx={3} fill="rgba(0,0,0,0.09)" />
      {/* shelf body */}
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
        rx={3} fill="url(#shelf-grad)" stroke={C.shelfStroke} strokeWidth={0.75} />
      {/* book spines */}
      {Array.from({ length: count }).map((_, k) => {
        const col = BOOK_COLORS[(idx * 5 + k) % BOOK_COLORS.length];
        return isH ? (
          <rect key={k} x={rect.x + 1 + k * step} y={rect.y + 2}
            width={Math.min(step - 1.5, rect.w - 2)} height={spine}
            rx={1} fill={col} fillOpacity={0.38} />
        ) : (
          <rect key={k} x={rect.x + 2} y={rect.y + 1 + k * step}
            width={spine} height={Math.min(step - 1.5, rect.h - 2)}
            rx={1} fill={col} fillOpacity={0.38} />
        );
      })}
      {/* front edge highlight */}
      {isH ? (
        <line x1={rect.x + 2} y1={rect.y} x2={rect.x + rect.w - 2} y2={rect.y}
          stroke="#E8D8C0" strokeWidth={0.8} />
      ) : (
        <line x1={rect.x} y1={rect.y + 2} x2={rect.x} y2={rect.y + rect.h - 2}
          stroke="#E8D8C0" strokeWidth={0.8} />
      )}
    </g>
  );
}

function Bookshelves() {
  const room = ROOMS.find((r) => r.id === "bookshelf-center")!;
  const bars  = shelvesFor(room.rect, "horizontal");
  return <g>{bars.map((b, i) => <Shelf key={i} rect={b} idx={i} />)}</g>;
}

function CubicleExtraShelves() {
  // Row 1 (existing)
  const row1Left  = [
    { x: 62,   y: 800, w: 142, h: 17, idx: 20 },
    { x: 238,  y: 800, w: 142, h: 17, idx: 21 },
  ];
  const row1Right = [
    { x: 876,  y: 800, w: 142, h: 17, idx: 22 },
    { x: 1052, y: 800, w: 142, h: 17, idx: 23 },
  ];
  // Row 2 (new — one extra shelf per side)
  const row2Left  = [
    { x: 62,   y: 826, w: 142, h: 17, idx: 24 },
    { x: 238,  y: 826, w: 142, h: 17, idx: 25 },
  ];
  const row2Right = [
    { x: 876,  y: 826, w: 142, h: 17, idx: 26 },
    { x: 1052, y: 826, w: 142, h: 17, idx: 27 },
  ];
  const all = [...row1Left, ...row1Right, ...row2Left, ...row2Right];

  return (
    <g>
      {/* tinted shelf area backgrounds — taller to cover both rows */}
      <rect x={52}  y={792} width={358} height={64} rx={6} fill={C.floorShelf} opacity={0.72} />
      <rect x={870} y={792} width={358} height={64} rx={6} fill={C.floorShelf} opacity={0.72} />
      {all.map(({ x, y, w, h, idx }) => (
        <Shelf key={idx} rect={{ x, y, w, h }} idx={idx} />
      ))}
      <text x={231}  y={865} textAnchor="middle" fontSize={7.5} fontWeight={700}
        fill={C.labelShelf} letterSpacing="0.07em" opacity={0.7}>REFERENCE BOOKS</text>
      <text x={1049} y={865} textAnchor="middle" fontSize={7.5} fontWeight={700}
        fill={C.labelShelf} letterSpacing="0.07em" opacity={0.7}>REFERENCE BOOKS</text>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Communal reading tables
───────────────────────────────────────────────────────────────────────────── */
function CommunalTables() {
  return (
    <g>
      {SEAT_BLOCKS.filter((b) => b.type === "open-desk").flatMap((block) =>
        communalTablesForBlock(block).map((t, i) => (
          <g key={`${block.prefix}-t${i}`}>
            {/* shadow */}
            <rect x={t.x + 2} y={t.y + 3} width={t.w} height={t.h}
              rx={10} fill="rgba(0,0,0,0.07)" />
            {/* table surface */}
            <rect x={t.x} y={t.y} width={t.w} height={t.h}
              rx={10} fill="url(#table-grad)" stroke={C.tableStroke} strokeWidth={1.25} />
            {/* wood grain lines */}
            {Array.from({ length: 5 }).map((_, g) => (
              <line key={g}
                x1={t.x + 28 + g * 36} y1={t.y + 4}
                x2={t.x + 28 + g * 36} y2={t.y + t.h - 4}
                stroke={C.tableStroke} strokeWidth={0.5} opacity={0.4} />
            ))}
            {/* top highlight */}
            <rect x={t.x + 8} y={t.y + 1} width={t.w - 16} height={2.5}
              rx={1.25} fill="#FFFFFF" fillOpacity={0.55} />
          </g>
        ))
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Discussion rooms — premium glass pods
───────────────────────────────────────────────────────────────────────────── */
function RoundTable({ cx, cy, r = 28 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      {/* shadow */}
      <circle cx={cx + 2} cy={cy + 3} r={r} fill="rgba(0,0,0,0.07)" />
      {/* surface */}
      <circle cx={cx} cy={cy} r={r} fill="url(#table-grad)" stroke={C.tableStroke} strokeWidth={1.25} />
      {/* inner ring */}
      <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={C.tableStroke} strokeWidth={0.6} opacity={0.45} />
      {/* top highlight */}
      <ellipse cx={cx - r * 0.25} cy={cy - r * 0.3} rx={r * 0.35} ry={r * 0.18}
        fill="rgba(255,255,255,0.40)" />
    </g>
  );
}

function DiscussionRooms() {
  const rooms = ROOMS.filter((r) => r.id.startsWith("discussion"));
  return (
    <g>
      {rooms.map((room, idx) => {
        const { rect, id } = room;
        const cx = rect.x + rect.w / 2;
        const cy = rect.y + rect.h / 2;
        const num = idx + 1;
        const doorW = 28;
        const doorX = rect.x + rect.w - doorW - 10;

        return (
          <g key={id}>
            {/* room shadow */}
            <rect x={rect.x + 2} y={rect.y + 3} width={rect.w} height={rect.h}
              rx={12} fill="rgba(0,0,0,0.07)" />

            {/* glass fill */}
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
              rx={12} fill="url(#glass-grad)" />

            {/* glass walls */}
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
              rx={12} fill="none" stroke={C.glassStroke} strokeWidth={2} />

            {/* top glint — simulates glass reflection */}
            <rect x={rect.x + 10} y={rect.y + 1} width={rect.w - 20} height={3}
              rx={1.5} fill={C.glassGlint} />
            <rect x={rect.x + 1} y={rect.y + 10} width={3} height={rect.h - 20}
              rx={1.5} fill={C.glassGlint} />

            {/* door gap */}
            <rect x={doorX} y={rect.y - 1} width={doorW} height={4}
              fill={C.floorDiscussion} />
            {/* door swing arc */}
            <path d={`M ${doorX} ${rect.y + 2} A ${doorW} ${doorW} 0 0 0 ${doorX + doorW} ${rect.y + 2 + doorW}`}
              fill={C.glassDoor} stroke={C.glassStroke} strokeWidth={0.8} strokeDasharray="3 2" />

            {/* round table */}
            <RoundTable cx={cx} cy={cy} r={26} />

            {/* room number badge */}
            <g>
              <rect x={rect.x + 9} y={rect.y + 8} width={24} height={19} rx={6}
                fill={C.glassStroke} fillOpacity={0.85} />
              <text x={rect.x + 21} y={rect.y + 21} textAnchor="middle"
                fontSize={10} fontWeight={800} fill="#fff" letterSpacing="0.02em">
                {num}
              </text>
            </g>

            {/* room label */}
            <text x={cx} y={rect.y + 30} textAnchor="middle"
              fontSize={7.5} fontWeight={700} fill={C.labelGlass}
              letterSpacing="0.06em" opacity={0.8}>
              ROOM {num}
            </text>

            {/* capacity badge */}
            <g>
              <rect x={rect.x + rect.w - 42} y={rect.y + 8} width={34} height={18} rx={6}
                fill="rgba(255,255,255,0.75)" stroke={C.glassStroke} strokeWidth={0.8} />
              <text x={rect.x + rect.w - 25} y={rect.y + 20} textAnchor="middle"
                fontSize={8} fontWeight={600} fill={C.labelGlass}>
                5 cap
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Window accents
───────────────────────────────────────────────────────────────────────────── */
function WindowAccents() {
  const wallX = BUILDING.x;
  const winH = 40, step = winH + 30;
  const wins: number[] = [];
  let y = 196;
  while (y + winH <= 552) { wins.push(y); y += step; }
  return (
    <g>
      {wins.map((wy, i) => (
        <g key={i}>
          <rect x={wallX - 3} y={wy} width={8} height={winH} rx={2}
            fill={C.windowFill} stroke={C.windowFrame} strokeWidth={1.2} />
          <rect x={wallX - 1} y={wy + 3} width={3} height={winH - 6} rx={1}
            fill={C.windowGlass} opacity={0.85} />
          <line x1={wallX - 3} y1={wy + winH / 2} x2={wallX + 5} y2={wy + winH / 2}
            stroke={C.windowFrame} strokeWidth={0.65} opacity={0.5} />
        </g>
      ))}
      <text x={wallX + 16} y={375} textAnchor="middle"
        fontSize={8} fontWeight={700} fill={C.labelMuted} letterSpacing="0.09em" opacity={0.55}
        transform={`rotate(-90, ${wallX + 16}, 375)`}>
        WINDOW SEATS
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Cubicle partitions
───────────────────────────────────────────────────────────────────────────── */
function CubiclePartitions() {
  return (
    <g>
      {SEAT_BLOCKS.filter((b) => b.type === "cubicle").map((block) => {
        const { area, rows, cols } = block;
        const cW = area.w / cols, cH = area.h / rows;
        return (
          <g key={block.prefix} opacity={0.55}>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <line key={`v${c}`}
                x1={area.x + cW * (c + 1)} y1={area.y + 8}
                x2={area.x + cW * (c + 1)} y2={area.y + area.h - 8}
                stroke={C.cubBorder} strokeWidth={1.75} />
            ))}
            {Array.from({ length: rows - 1 }).map((_, r) => (
              <line key={`h${r}`}
                x1={area.x + 8} y1={area.y + cH * (r + 1)}
                x2={area.x + area.w - 8} y2={area.y + cH * (r + 1)}
                stroke={C.cubBorder} strokeWidth={1.75} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Zone labels
───────────────────────────────────────────────────────────────────────────── */
function ZoneLabels() {
  const openMidY   = (178 + 168 + 368) / 2;  // ≈ 357 — gap between clusters
  const shelfLabelY = 162;
  const cubLabelY   = 582;
  const discLabelY  = 582;

  return (
    <g>
      {/* Open Reading Left */}
      <ZoneLabel
        cx={279} cy={openMidY}
        text="OPEN READING"
        sub="Left Wing · 20 seats"
        titleColor={C.labelMed}
        borderColor={C.openBorder}
        bgColor="rgba(240,252,245,0.92)"
      />

      {/* Open Reading Right */}
      <ZoneLabel
        cx={1001} cy={openMidY}
        text="OPEN READING"
        sub="Right Wing · 20 seats"
        titleColor={C.labelMed}
        borderColor={C.openBorder}
        bgColor="rgba(240,252,245,0.92)"
      />

      {/* Book Collection */}
      <ZoneLabel
        cx={640} cy={shelfLabelY}
        text="BOOK COLLECTION"
        sub="Central Stacks"
        titleColor={C.labelShelf}
        borderColor={C.shelfBorder}
        bgColor="rgba(253,250,242,0.92)"
      />

      {/* Cubicle Left */}
      <ZoneLabel
        cx={232} cy={cubLabelY}
        text="CUBICLE ZONE"
        sub="Left · 12 private desks"
        titleColor={C.labelCubicle}
        borderColor={C.cubBorder}
        bgColor="rgba(242,245,252,0.92)"
      />

      {/* Cubicle Right */}
      <ZoneLabel
        cx={1048} cy={cubLabelY}
        text="CUBICLE ZONE"
        sub="Right · 12 private desks"
        titleColor={C.labelCubicle}
        borderColor={C.cubBorder}
        bgColor="rgba(242,245,252,0.92)"
      />

      {/* Discussion Rooms */}
      <ZoneLabel
        cx={640} cy={discLabelY}
        text="DISCUSSION ROOMS"
        sub="Glass pods · 5 seats each"
        titleColor={C.labelGlass}
        borderColor={C.discBorder}
        bgColor="rgba(235,250,242,0.92)"
      />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Zone separator lines — internal architectural walls
───────────────────────────────────────────────────────────────────────────── */
function ZoneSeparators() {
  return (
    <g stroke={C.wall} strokeWidth={1.5} strokeLinecap="round" opacity={0.25}>
      {/* Open ↔ Cubicle */}
      <line x1={BUILDING.x} y1={572} x2={BUILDING.x + BUILDING.w} y2={572} />
      {/* Vertical: open left | bookshelf */}
      <line x1={526} y1={160} x2={526} y2={568} />
      <line x1={537} y1={160} x2={537} y2={568} />
      {/* Vertical: bookshelf | open right */}
      <line x1={743} y1={160} x2={743} y2={568} />
      <line x1={754} y1={160} x2={754} y2={568} />
      {/* Vertical: cubicle left | discussion */}
      <line x1={432} y1={572} x2={432} y2={BUILDING.y + BUILDING.h} />
      <line x1={448} y1={572} x2={448} y2={BUILDING.y + BUILDING.h} />
      {/* Vertical: discussion | cubicle right */}
      <line x1={832} y1={572} x2={832} y2={BUILDING.y + BUILDING.h} />
      <line x1={848} y1={572} x2={848} y2={BUILDING.y + BUILDING.h} />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Open zone backgrounds — clean fills, no dot grid
───────────────────────────────────────────────────────────────────────────── */
function OpenZoneBackground({ room }: { room: RoomDef }) {
  const { rect } = room;
  return (
    <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="url(#open-grad)" />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mini legend (integrated into the map, bottom-left inside building)
───────────────────────────────────────────────────────────────────────────── */
function MapLegend() {
  const items = [
    { label: "Available",   color: "hsl(158 55% 64%)" },
    { label: "Occupied",    color: "hsl(0 68% 64%)"   },
    { label: "Away",        color: "hsl(38 88% 62%)"  },
    { label: "Abandoned",   color: "hsl(210 14% 62%)" },
    { label: "Maintenance", color: "hsl(210 68% 60%)" },
  ];

  const padX   = 14;   // horizontal padding inside pill
  const padY   = 8;    // vertical padding inside pill
  const dotR   = 4.5;
  const gap    = 6;    // gap between dot and label
  const sep    = 18;   // gap between items
  const fSize  = 8;
  const chW    = fSize * 0.52; // approximate char width

  // measure each item: dot diameter + gap + text width
  const itemWidths = items.map((it) => dotR * 2 + gap + it.label.length * chW);
  const totalInner = itemWidths.reduce((a, b) => a + b, 0) + sep * (items.length - 1);
  const totalW     = totalInner + padX * 2;
  const pillH      = dotR * 2 + padY * 2;

  const cx = BUILDING.x + BUILDING.w / 2;
  const py = BUILDING.y + BUILDING.h - pillH - 10; // 10px above the bottom wall

  let curX = cx - totalW / 2 + padX;

  return (
    <g>
      {/* pill shadow */}
      <rect x={cx - totalW / 2 + 1} y={py + 2} width={totalW} height={pillH}
        rx={pillH / 2} fill="rgba(0,0,0,0.06)" />
      {/* pill background */}
      <rect x={cx - totalW / 2} y={py} width={totalW} height={pillH}
        rx={pillH / 2} fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.09)" strokeWidth={1} />

      {/* items — laid out left-to-right with measured widths */}
      {items.map((item, i) => {
        const ix = curX;
        curX += itemWidths[i] + sep;
        return (
          <g key={item.label}>
            <circle cx={ix + dotR} cy={py + pillH / 2} r={dotR} fill={item.color} />
            <text
              x={ix + dotR * 2 + gap}
              y={py + pillH / 2 + fSize * 0.36}
              fontSize={fSize} fontWeight={600}
              fill={C.labelMuted} letterSpacing="0.02em"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main FloorPlan component
───────────────────────────────────────────────────────────────────────────── */
export function FloorPlan() {
  const openRooms    = ROOMS.filter((r) => r.id.startsWith("open-"));
  const cubicleRooms = ROOMS.filter((r) => r.id.startsWith("cubicle-"));
  const bookshelfRoom = ROOMS.find((r) => r.id === "bookshelf-center")!;

  return (
    <g>
      <Defs />

      {/* ── Outer context (parking lot / pathway) ── */}
      <rect x={BUILDING.x - 20} y={BUILDING.y - 20}
        width={BUILDING.w + 40} height={BUILDING.h + 40}
        rx={28} fill={C.exterior} />
      {/* subtle inner shadow ring */}
      <rect x={BUILDING.x - 8} y={BUILDING.y - 8}
        width={BUILDING.w + 16} height={BUILDING.h + 16}
        rx={20} fill={C.exteriorShadow} />

      {/* ── Building shell ── */}
      <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h}
        rx={16} fill={C.floor} stroke={C.wall} strokeWidth={6} />

      {/* foyer removed — viewBox crops above y=128 */}

      {/* ── Open zone backgrounds ── */}
      {openRooms.map((r) => <OpenZoneBackground key={r.id} room={r} />)}

      {/* ── Bookshelf zone ── */}
      <rect x={bookshelfRoom.rect.x} y={bookshelfRoom.rect.y}
        width={bookshelfRoom.rect.w} height={bookshelfRoom.rect.h}
        fill={C.floorShelf} />

      {/* ── Cubicle zone backgrounds ── */}
      {cubicleRooms.map((r) => (
        <rect key={r.id} x={r.rect.x} y={r.rect.y} width={r.rect.w} height={r.rect.h}
          fill="url(#cub-grad)" />
      ))}

      {/* ── Discussion zone background ── */}
      <rect x={448} y={578} width={384} height={282} rx={6} fill={C.floorDiscussion} />

      {/* ── Zone separator lines (subtle internal walls) ── */}
      <ZoneSeparators />

      {/* bag lockers removed */}

      {/* ── Bookshelves ── */}
      <Bookshelves />

      {/* ── Extra bookshelves in cubicle freed rows ── */}
      <CubicleExtraShelves />

      {/* ── Windows ── */}
      <WindowAccents />

      {/* ── Cubicle partitions ── */}
      <CubiclePartitions />

      {/* ── Communal tables ── */}
      <CommunalTables />

      {/* ── Discussion rooms ── */}
      <DiscussionRooms />

      {/* ── Zone labels ── */}
      <ZoneLabels />

      {/* ── Integrated map legend ── */}
      <MapLegend />
    </g>
  );
}
