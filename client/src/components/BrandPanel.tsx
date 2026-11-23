import type { CSSProperties } from "react";
import { APP_NAME } from "../config";

interface Block {
  col: number;
  row: number;
  span: number;
  hot?: boolean;
}

// Purely decorative: a day grid of booked slots, one of them highlighted.
const blocks: Block[] = [
  { col: 1, row: 1, span: 2 },
  { col: 1, row: 4, span: 1 },
  { col: 2, row: 2, span: 3 },
  { col: 2, row: 6, span: 2 },
  { col: 3, row: 1, span: 1 },
  { col: 3, row: 3, span: 2, hot: true },
  { col: 3, row: 6, span: 1 },
  { col: 4, row: 2, span: 1 },
  { col: 4, row: 4, span: 2 },
];

const times: { label: string; row: number }[] = [
  { label: "8:00", row: 1 },
  { label: "9:00", row: 3 },
  { label: "10:00", row: 5 },
  { label: "11:00", row: 7 },
];

export default function BrandPanel() {
  return (
    <aside className="brand">
      <div className="brand__name">
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
          <rect width="28" height="28" rx="7" fill="currentColor" opacity="0.18" />
          <path
            d="M5 15c3-5 5-5 8 0s5 5 8 0"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>{APP_NAME}</span>
      </div>

      <div className="brand__body">
        <h2>Book every visit once, in the right slot.</h2>
        <p>Manage provider availability, appointments, and patient intake in one place.</p>
      </div>

      <div className="grid" aria-hidden="true">
        {times.map((t) => (
          <span key={t.label} className="grid__time" style={{ gridRow: t.row }}>
            {t.label}
          </span>
        ))}
        {blocks.map((b, i) => {
          const style: CSSProperties = {
            gridColumn: b.col + 1,
            gridRow: `${b.row} / span ${b.span}`,
          };
          return <span key={i} className={b.hot ? "grid__slot grid__slot--hot" : "grid__slot"} style={style} />;
        })}
      </div>
    </aside>
  );
}
