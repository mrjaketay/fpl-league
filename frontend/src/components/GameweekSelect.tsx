// Reusable gameweek dropdown — I wanted every GW field to be a proper
// dropdown instead of a bare number box, so this replaces plain number
// inputs everywhere a gameweek needs picking.
export default function GameweekSelect({
  value,
  onChange,
  max = 38,
}: {
  value: number;
  onChange: (gw: number) => void;
  max?: number;
}) {
  return (
    <select className="gw-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>Gameweek {n}</option>
      ))}
    </select>
  );
}
