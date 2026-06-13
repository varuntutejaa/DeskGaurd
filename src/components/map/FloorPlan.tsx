import {
  BUILDING,
  ENTRANCE,
  RECEPTION,
  ROOMS,
  SEAT_BLOCKS,
  shelvesFor,
  communalTablesForBlock,
  type RoomDef,
} from "@/features/seats/geometry";

/* -------------------------------------------------------------------------
   Palette
   ------------------------------------------------------------------------- */
const C = {
  floor:        "#f5f8f5",
  floorFoyer:   "#eef3ee",
  floorShelf:   "#f7f3ea",
  wall:         "#9ab0a4",
  wallAccent:   "#7a9a8c",

  openFill:     "#eef7f1",
  openStroke:   "#b8d4c4",
  cubicFill:    "#f0f4f2",
  cubicStroke:  "#bcccc4",
  glassFill:    "rgba(198,236,218,0.38)",
  glassStroke:  "#6dbf9a",
  lockerFill:   "#edf2ef",
  lockerStroke: "#b0c4b8",

  tableTop:     "#e3ece6",
  tableStroke:  "#c4d4ca",
  chairFill:    "#d8e6dc",
  chairStroke:  "#a8c2b2",

  shelf:        "#c8b896",
  shelfStroke:  "#a89678",
  shelfShadow:  "#b0a282",

  recepFill:    "hsl(158 38% 90%)",
  recepStroke:  "hsl(158 52% 52%)",
  recepText:    "hsl(158 52% 28%)",

  windowFill:   "hsl(210 55% 88%)",
  windowFrame:  "hsl(210 30% 60%)",
  windowGlass:  "hsl(210 60% 94%)",

  labelStrong:  "hsl(160 22% 22%)",
  labelMed:     "hsl(160 14% 36%)",
  labelMuted:   "hsl(160 10% 50%)",
  labelGlass:   "hsl(158 55% 26%)",
  pillBg:       "rgba(255,255,255,0.88)",
  pillStroke:   "#b8d4c4",

  aisle:        "#e8f0ea",
  aisleLine:    "#d4e0d8",
};

const BOOK_COLORS = [
  "#c46b4a", "#5888a2", "#c8a03c", "#6aaa72",
  "#9470b8", "#d45a5a", "#5aacac", "#b87840",
];

/* -------------------------------------------------------------------------
   Pill badge — used for zone labels inside each zone
   ------------------------------------------------------------------------- */
function ZonePill({ cx, cy, text, sub, color = C.labelStrong, stroke = C.pillStroke }: {
  cx: number; cy: number; text: string; sub?: string;
  color?: string; stroke?: string;
}) {
  const mainW  = text.length * 5.8 + 20;
  const totalH = sub ? 30 : 18;
  return (
    <g>
      <rect
        x={cx - mainW / 2} y={cy - totalH / 2}
        width={mainW} height={totalH}
        rx={totalH / 2}
        fill={C.pillBg}
        stroke={stroke}
        strokeWidth={1}
      />
      <text x={cx} y={cy + (sub ? -3 : 4)} textAnchor="middle"
        fontSize={9} fontWeight={700} fill={color} letterSpacing="0.05em">
        {text}
      </text>
      {sub && (
        <text x={cx} y={cy + 10} textAnchor="middle"
          fontSize={7.5} fontWeight={500} fill={C.labelMuted}>
          {sub}
        </text>
      )}
    </g>
  );
}

/* -------------------------------------------------------------------------
   Bookshelves with coloured book spines
   ------------------------------------------------------------------------- */
function Shelf({ rect, idx }: { rect: { x: number; y: number; w: number; h: number }; idx: number }) {
  const isH    = rect.w > rect.h;
  const spine  = isH ? rect.h - 2 : rect.w - 2;
  const span   = isH ? rect.w : rect.h;
  const step   = 11;
  const count  = Math.max(1, Math.floor(span / step));
  return (
    <g>
      <rect x={rect.x + (isH ? 0 : 2)} y={rect.y + (isH ? 2 : 0)}
        width={rect.w} height={rect.h} rx={2} fill={C.shelfShadow} opacity={0.3} />
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
        rx={2} fill={C.shelf} stroke={C.shelfStroke} strokeWidth={0.75} />
      {Array.from({ length: count }).map((_, k) => {
        const col = BOOK_COLORS[(idx * 7 + k) % BOOK_COLORS.length];
        return isH ? (
          <rect key={k} x={rect.x + 1 + k * step} y={rect.y + 1}
            width={Math.min(step - 1, rect.w - 2)} height={spine}
            rx={1} fill={col} fillOpacity={0.32} />
        ) : (
          <rect key={k} x={rect.x + 1} y={rect.y + 1 + k * step}
            width={spine} height={Math.min(step - 1, rect.h - 2)}
            rx={1} fill={col} fillOpacity={0.32} />
        );
      })}
    </g>
  );
}

function Bookshelves() {
  const room = ROOMS.find((r) => r.id === "bookshelf-center")!;
  const bars  = shelvesFor(room.rect, "horizontal");
  return <g>{bars.map((b, i) => <Shelf key={i} rect={b} idx={i} />)}</g>;
}

/* Bookshelves in freed bottom space of cubicle zones */
function CubicleExtraShelves() {
  // Left cubicle: 4th row removed → freed y: 784–848, x: 52–412
  const leftShelves = [
    { x: 60,  y: 800, w: 148, h: 18, idx: 20 },
    { x: 240, y: 800, w: 148, h: 18, idx: 21 },
  ];
  // Right cubicle: bottom open space y: 784–848, x: 868–1228
  const rightShelves = [
    { x: 874, y: 800, w: 148, h: 18, idx: 22 },
    { x: 1054, y: 800, w: 148, h: 18, idx: 23 },
  ];
  const all = [...leftShelves, ...rightShelves];
  return (
    <g>
      {/* tinted floor under shelf areas */}
      <rect x={52}  y={790} width={360} height={58} rx={4} fill={C.floorShelf} opacity={0.7} />
      <rect x={868} y={790} width={360} height={58} rx={4} fill={C.floorShelf} opacity={0.7} />
      {all.map(({ x, y, w, h, idx }) => (
        <Shelf key={idx} rect={{ x, y, w, h }} idx={idx} />
      ))}
      {/* shelf area labels */}
      <text x={232} y={860} textAnchor="middle" fontSize={7.5} fontWeight={600}
        fill={C.labelMuted} letterSpacing="0.06em">REFERENCE BOOKS</text>
      <text x={1048} y={860} textAnchor="middle" fontSize={7.5} fontWeight={600}
        fill={C.labelMuted} letterSpacing="0.06em">REFERENCE BOOKS</text>
    </g>
  );
}

/* -------------------------------------------------------------------------
   Communal tables in open-reading zones
   ------------------------------------------------------------------------- */
function CommunalTables() {
  return (
    <g>
      {SEAT_BLOCKS.filter((b) => b.type === "open-desk").flatMap((block) =>
        communalTablesForBlock(block).map((t, i) => (
          <g key={`${block.prefix}-t${i}`}>
            <rect x={t.x + 2} y={t.y + 2} width={t.w} height={t.h}
              rx={9} fill={C.tableStroke} opacity={0.2} />
            <rect x={t.x} y={t.y} width={t.w} height={t.h}
              rx={9} fill={C.tableTop} stroke={C.tableStroke} strokeWidth={1.2} />
            {/* wood grain */}
            {Array.from({ length: 4 }).map((_, g) => (
              <line key={g}
                x1={t.x + 22 + g * 38} y1={t.y + 4}
                x2={t.x + 22 + g * 38} y2={t.y + t.h - 4}
                stroke={C.tableStroke} strokeWidth={0.6} opacity={0.45} />
            ))}
          </g>
        ))
      )}
    </g>
  );
}

/* -------------------------------------------------------------------------
   Discussion rooms — round tables with 5 chairs
   ------------------------------------------------------------------------- */
function RoundTable({ cx, cy, tableR = 30 }: {
  cx: number; cy: number; tableR?: number;
}) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* shadow under table */}
      <circle cx={1.5} cy={2} r={tableR} fill="rgba(0,0,0,0.08)" />
      {/* table surface */}
      <circle cx={0} cy={0} r={tableR}
        fill={C.tableTop} stroke={C.tableStroke} strokeWidth={1.3} />
      {/* inner ring (glass top effect) */}
      <circle cx={0} cy={0} r={tableR - 5}
        fill="none" stroke={C.tableStroke} strokeWidth={0.5} opacity={0.5} />
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
        return (
          <g key={id}>
            {/* glass room */}
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
              rx={10} fill={C.glassFill} stroke={C.glassStroke} strokeWidth={1.8} />
            {/* top-edge glint */}
            <rect x={rect.x + 8} y={rect.y + 1} width={rect.w - 16} height={2}
              rx={1} fill="#fff" opacity={0.55} />
            {/* door gap */}
            <rect x={rect.x + rect.w - 28} y={rect.y - 1} width={24} height={4}
              fill={C.floor} />

            {/* round table */}
            <RoundTable cx={cx} cy={cy} tableR={28} />

            {/* room number badge */}
            <g transform={`translate(${rect.x + 8}, ${rect.y + 8})`}>
              <rect x={0} y={0} width={20} height={16} rx={5}
                fill={C.glassStroke} fillOpacity={0.7} />
              <text x={10} y={11.5} textAnchor="middle" fontSize={9}
                fontWeight={800} fill="#fff">
                {num}
              </text>
            </g>

            {/* label inside room, below the badge */}
            <text
              x={cx} y={rect.y + 27}
              textAnchor="middle" fontSize={7.5} fontWeight={600}
              fill={C.labelGlass} opacity={0.75} letterSpacing="0.04em"
            >
              DISC. ROOM {num}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* -------------------------------------------------------------------------
   Bag lockers
   ------------------------------------------------------------------------- */
function BagLockers() {
  return (
    <g>
      {ROOMS.filter((r) => r.id.startsWith("locker")).map((room) => {
        const { rect, id } = room;
        const cols = 3, rows = 2;
        const cW = rect.w / cols, cH = rect.h / rows;
        return (
          <g key={id}>
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
              rx={8} fill={C.lockerFill} stroke={C.lockerStroke} strokeWidth={1.5} />
            {Array.from({ length: cols }).flatMap((_, c) =>
              Array.from({ length: rows }).map((_, r) => (
                <g key={`${c}-${r}`}>
                  <rect
                    x={rect.x + c * cW + 3} y={rect.y + r * cH + 3}
                    width={cW - 6} height={cH - 6}
                    rx={3} fill="#f8fbf9" stroke={C.lockerStroke} strokeWidth={0.8} />
                  <circle
                    cx={rect.x + c * cW + cW / 2}
                    cy={rect.y + r * cH + cH / 2}
                    r={2.5} fill={C.lockerStroke} opacity={0.5} />
                </g>
              ))
            )}
            {/* label inside locker bank */}
            <text
              x={rect.x + rect.w / 2} y={rect.y + rect.h + 14}
              textAnchor="middle" fontSize={8.5} fontWeight={600}
              fill={C.labelMuted} letterSpacing="0.04em">
              BAG LOCKERS
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* -------------------------------------------------------------------------
   Window accents on left wall
   ------------------------------------------------------------------------- */
function WindowAccents() {
  const wallX = BUILDING.x;
  const winH  = 42, step = winH + 32;
  const wins: number[] = [];
  let y = 196;
  while (y + winH <= 556) { wins.push(y); y += step; }
  return (
    <g>
      {wins.map((wy, i) => (
        <g key={i}>
          <rect x={wallX - 4} y={wy} width={10} height={winH} rx={2}
            fill={C.windowFill} stroke={C.windowFrame} strokeWidth={1.25} />
          <rect x={wallX - 2} y={wy + 3} width={3} height={winH - 6} rx={1}
            fill={C.windowGlass} opacity={0.8} />
          <line x1={wallX - 4} y1={wy + winH / 2} x2={wallX + 6} y2={wy + winH / 2}
            stroke={C.windowFrame} strokeWidth={0.7} opacity={0.55} />
        </g>
      ))}
      <text x={wallX + 14} y={376} textAnchor="middle"
        fontSize={8.5} fontWeight={600} fill={C.labelMuted}
        letterSpacing="0.09em" opacity={0.6}
        transform={`rotate(-90, ${wallX + 14}, 376)`}>
        WINDOW SEATS
      </text>
    </g>
  );
}

/* -------------------------------------------------------------------------
   Cubicle partition grid
   ------------------------------------------------------------------------- */
function CubiclePartitions() {
  return (
    <g>
      {SEAT_BLOCKS.filter((b) => b.type === "cubicle").map((block) => {
        const { area, rows, cols } = block;
        const cW = area.w / cols, cH = area.h / rows;
        return (
          <g key={block.prefix}>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <line key={`v${c}`}
                x1={area.x + cW * (c + 1)} y1={area.y + 6}
                x2={area.x + cW * (c + 1)} y2={area.y + area.h - 6}
                stroke={C.cubicStroke} strokeWidth={1.5} />
            ))}
            {Array.from({ length: rows - 1 }).map((_, r) => (
              <line key={`h${r}`}
                x1={area.x + 6} y1={area.y + cH * (r + 1)}
                x2={area.x + area.w - 6} y2={area.y + cH * (r + 1)}
                stroke={C.cubicStroke} strokeWidth={1.5} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/* -------------------------------------------------------------------------
   Zone labels — all positioned INSIDE their zones, no overlap with aisles
   Open zones: label centred in the 22 px gap between top & bottom clusters
   Bookshelf:  label at very top of zone (above first shelf bar)
   Cubicles:   label at very top of zone (above first seat row)
   Discussion: labelled individually inside each glass room
   ------------------------------------------------------------------------- */
function ZoneLabels() {
  /* Open Left/Right: gap between clusters y=346–368, centre y=357 */
  const OLT_AREA_BOT = 178 + 168;          // 346
  const OLB_AREA_TOP = 368;
  const openMidY = (OLT_AREA_BOT + OLB_AREA_TOP) / 2;  // 357

  /* Bookshelf zone top: y=148, first bar starts y≈176 → use y=163 */
  const shelfLabelY = 163;

  /* Cubicle zones: y=572, first seat area y=592 → use gap centre y=582 */
  const cubLabelY = 582;

  return (
    <g>
      {/* ── Open Reading Left ────────────────────────────────────── */}
      <ZonePill cx={279} cy={openMidY} text="OPEN READING" sub="Left Wing · 20 seats" />

      {/* ── Open Reading Right ───────────────────────────────────── */}
      <ZonePill cx={1001} cy={openMidY} text="OPEN READING" sub="Right Wing · 20 seats" />

      {/* ── Book Collection ──────────────────────────────────────── */}
      <ZonePill cx={640} cy={shelfLabelY} text="BOOK COLLECTION" sub="Central Stacks" />

      {/* ── Cubicle Left ─────────────────────────────────────────── */}
      <ZonePill cx={232} cy={cubLabelY} text="CUBICLE ZONE" sub="12 private desks" />

      {/* ── Cubicle Right ────────────────────────────────────────── */}
      <ZonePill cx={1048} cy={cubLabelY} text="CUBICLE ZONE" sub="12 private desks" />

      {/* ── Discussion section header (between aisle and rooms) ───── */}
      <ZonePill
        cx={640} cy={cubLabelY}
        text="DISCUSSION ROOMS"
        sub="Glass pods · 5 seats each"
        stroke={C.glassStroke}
        color={C.labelGlass}
      />
    </g>
  );
}

/* -------------------------------------------------------------------------
   Reception desk
   ------------------------------------------------------------------------- */
function ReceptionDesk() {
  const { x, y, w, h } = RECEPTION;
  const cx = x + w / 2;
  return (
    <g>
      {/* drop shadow */}
      <path d={`M ${x+14} ${y+h+4} L ${x+14} ${y+14}
          Q ${x+14} ${y+4} ${x+26} ${y+4}
          L ${x+w-26} ${y+4} Q ${x+w-14} ${y+4} ${x+w-14} ${y+14}
          L ${x+w-14} ${y+h+4} Z`}
        fill="rgba(0,0,0,0.055)" />
      {/* surface */}
      <path d={`M ${x+14} ${y+h} L ${x+14} ${y+14}
          Q ${x+14} ${y} ${x+26} ${y}
          L ${x+w-26} ${y} Q ${x+w-14} ${y} ${x+w-14} ${y+14}
          L ${x+w-14} ${y+h} Z`}
        fill={C.recepFill} stroke={C.recepStroke} strokeWidth={1.6} />
      {/* counter front edge */}
      <line x1={x+14} y1={y+h} x2={x+w-14} y2={y+h}
        stroke={C.recepStroke} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
      {/* monitors */}
      <rect x={cx-34} y={y+5} width={22} height={16} rx={3}
        fill={C.recepStroke} fillOpacity={0.22} stroke={C.recepStroke} strokeWidth={0.8} />
      <rect x={cx+12} y={y+5} width={22} height={16} rx={3}
        fill={C.recepStroke} fillOpacity={0.22} stroke={C.recepStroke} strokeWidth={0.8} />
      {/* label */}
      <text x={cx} y={y + h/2 + 5} textAnchor="middle"
        fontSize={13} fontWeight={700} letterSpacing="0.06em" fill={C.recepText}>
        RECEPTION
      </text>
    </g>
  );
}

/* -------------------------------------------------------------------------
   Entrance
   ------------------------------------------------------------------------- */
function EntranceArch() {
  const { x, y, w } = ENTRANCE;
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y - 5} width={w} height={10} fill={C.floor} />
      {/* double-door arcs */}
      <path d={`M ${cx} ${y+2} A ${w/2} ${w/2} 0 0 0 ${x} ${y+2}`}
        fill="none" stroke={C.recepStroke} strokeWidth={1.2} opacity={0.5} />
      <path d={`M ${cx} ${y+2} A ${w/2} ${w/2} 0 0 1 ${x+w} ${y+2}`}
        fill="none" stroke={C.recepStroke} strokeWidth={1.2} opacity={0.5} />
      {/* frame posts */}
      <line x1={x}   y1={y-2} x2={x}   y2={y+4} stroke={C.wallAccent} strokeWidth={3} />
      <line x1={x+w} y1={y-2} x2={x+w} y2={y+4} stroke={C.wallAccent} strokeWidth={3} />
      {/* label */}
      <text x={cx} y={y+26} textAnchor="middle"
        fontSize={10.5} fontWeight={700} letterSpacing="0.08em" fill={C.labelMuted}>
        ▲  MAIN ENTRANCE
      </text>
    </g>
  );
}

/* -------------------------------------------------------------------------
   You-are-here pin
   ------------------------------------------------------------------------- */
function YouAreHere() {
  const px = 640, py = 112;
  const col = "hsl(158 64% 24%)";
  return (
    <g>
      <circle cx={px} cy={py} r={6} fill={col} opacity={0.2}>
        <animate attributeName="r" values="6;20;6" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.22;0;0.22" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <path d={`M ${px} ${py+9} L ${px-5} ${py-1} L ${px+5} ${py-1} Z`} fill={col} />
      <circle cx={px} cy={py-6} r={9} fill={col} stroke="#fff" strokeWidth={2} />
      <circle cx={px} cy={py-6} r={3} fill="#fff" />
      <g transform={`translate(${px+14}, ${py-17})`}>
        <rect width={94} height={22} rx={11} fill="#fff" stroke={C.recepStroke} strokeWidth={1} />
        <text x={47} y={15.5} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={col}>
          You are here
        </text>
      </g>
    </g>
  );
}

/* -------------------------------------------------------------------------
   Open zone dot-grid background
   ------------------------------------------------------------------------- */
function OpenZoneBackground({ room }: { room: RoomDef }) {
  const { rect } = room;
  return (
    <g>
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill={C.openFill} />
      {Array.from({ length: Math.floor(rect.w / 40) }).flatMap((_, ci) =>
        Array.from({ length: Math.floor(rect.h / 40) }).map((_, ri) => (
          <circle key={`${ci}-${ri}`}
            cx={rect.x + 20 + ci * 40}
            cy={rect.y + 20 + ri * 40}
            r={1.1} fill={C.openStroke} opacity={0.32} />
        ))
      )}
    </g>
  );
}

/* -------------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------------- */
export function FloorPlan() {
  const openRooms     = ROOMS.filter((r) => r.id.startsWith("open-"));
  const cubicleRooms  = ROOMS.filter((r) => r.id.startsWith("cubicle-"));
  const bookshelfRoom = ROOMS.find((r) => r.id === "bookshelf-center")!;

  return (
    <g>
      {/* outer ground plane */}
      <rect x={BUILDING.x - 16} y={BUILDING.y - 16}
        width={BUILDING.w + 32} height={BUILDING.h + 32}
        rx={24} fill="#e8eeea" />

      {/* building shell */}
      <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h}
        rx={14} fill={C.floor} stroke={C.wall} strokeWidth={5} />

      {/* foyer tint */}
      <rect x={BUILDING.x + 2} y={BUILDING.y + 2}
        width={BUILDING.w - 4} height={130}
        rx={12} fill={C.floorFoyer} opacity={0.8} />

      {/* open zone backgrounds */}
      {openRooms.map((r) => <OpenZoneBackground key={r.id} room={r} />)}

      {/* bookshelf background */}
      <rect x={bookshelfRoom.rect.x} y={bookshelfRoom.rect.y}
        width={bookshelfRoom.rect.w} height={bookshelfRoom.rect.h}
        fill={C.floorShelf} />

      {/* cubicle zone backgrounds */}
      {cubicleRooms.map((r) => (
        <rect key={r.id} x={r.rect.x} y={r.rect.y} width={r.rect.w} height={r.rect.h}
          fill={C.cubicFill} />
      ))}

      {/* horizontal aisle — middle ↔ bottom */}
      <rect x={BUILDING.x} y={566} width={BUILDING.w} height={7} fill={C.aisle} />
      <line x1={BUILDING.x} y1={566} x2={BUILDING.x + BUILDING.w} y2={566}
        stroke={C.aisleLine} strokeWidth={1} />
      <line x1={BUILDING.x} y1={573} x2={BUILDING.x + BUILDING.w} y2={573}
        stroke={C.aisleLine} strokeWidth={1} />

      {/* vertical aisles — left / bookshelf / right */}
      <rect x={524} y={160} width={13} height={406} fill={C.aisle} />
      <rect x={743} y={160} width={13} height={406} fill={C.aisle} />

      {/* vertical aisles — bottom section */}
      <rect x={430} y={573} width={20} height={295} fill={C.aisle} />
      <rect x={830} y={573} width={20} height={295} fill={C.aisle} />

      {/* bag lockers */}
      <BagLockers />

      {/* bookshelves */}
      <Bookshelves />

      {/* extra bookshelves in cubicle freed areas */}
      <CubicleExtraShelves />

      {/* window accents */}
      <WindowAccents />

      {/* cubicle partitions */}
      <CubiclePartitions />

      {/* communal tables */}
      <CommunalTables />

      {/* discussion rooms (round tables + 5 chairs) */}
      <DiscussionRooms />

      {/* reception */}
      <ReceptionDesk />

      {/* zone labels — all inside their zones */}
      <ZoneLabels />

      {/* entrance */}
      <EntranceArch />

      {/* you-are-here */}
      <YouAreHere />
    </g>
  );
}
