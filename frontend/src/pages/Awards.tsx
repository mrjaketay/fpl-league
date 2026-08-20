import { useEffect, useState } from 'react';
import { api } from '../api/client';

const LABELS: Record<string, { label: string; tone: 'amber' | 'red' | 'plain' }> = {
  manager_of_week: { label: 'Manager of the Week', tone: 'amber' },
  donkey_of_week: { label: 'Donkey of the Week', tone: 'red' },
  hall_of_fame: { label: 'Hall of Fame (100+, no chip)', tone: 'amber' },
  captains_curse: { label: "Captain's Curse", tone: 'red' },
  bench_bandit: { label: 'Bench Bandit', tone: 'plain' },
  transfer_villain: { label: 'Transfer Villain', tone: 'red' },
  the_wall: { label: 'The Wall (best defense)', tone: 'amber' },
  the_sieve: { label: 'The Sieve (worst defense)', tone: 'red' },
};

type Award = {
  award_type: string;
  entry_id: number;
  manager_name: string;
  team_name: string;
  value: number;
  details: any;
};

export default function Awards() {
  const [gw, setGw] = useState(1);
  const [awards, setAwards] = useState<Award[]>([]);
  const [tally, setTally] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.gameweekAwards(gw).then(setAwards).catch((e) => setError(e.message));
  }, [gw]);

  useEffect(() => {
    api.seasonTally().then(setTally).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Gameweek</h2>
          <input
            type="number"
            min={1}
            max={38}
            value={gw}
            onChange={(e) => setGw(Number(e.target.value))}
            className="mono"
            style={{ width: 60, background: 'transparent', color: 'var(--chalk)', border: '1px solid var(--line)', borderRadius: 4, padding: '0.3rem 0.5rem' }}
          />
        </div>

        {error && <p className="mono pill pill--red">{error}</p>}
        {awards.length === 0 && !error && <p style={{ color: 'var(--chalk-dim)' }}>No awards computed for this gameweek yet.</p>}

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {awards.map((a) => {
            const meta = LABELS[a.award_type] ?? { label: a.award_type, tone: 'plain' };
            return (
              <div key={`${a.award_type}-${a.entry_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '0.6rem' }}>
                <div>
                  <span className={`pill ${meta.tone === 'amber' ? 'pill--amber' : meta.tone === 'red' ? 'pill--red' : ''}`}>{meta.label}</span>
                  <div style={{ marginTop: '0.4rem' }}>{a.manager_name} <span style={{ color: 'var(--chalk-dim)' }}>({a.team_name})</span></div>
                </div>
                <div className="mono" style={{ fontSize: '1.2rem' }}>{a.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Trophy Cabinet</h2>
        <table>
          <thead><tr><th>Manager</th><th>Award</th><th>Wins</th></tr></thead>
          <tbody>
            {tally.map((t, i) => (
              <tr key={i}>
                <td>{t.manager_name}</td>
                <td style={{ color: 'var(--chalk-dim)' }}>{LABELS[t.award_type]?.label ?? t.award_type}</td>
                <td className="num">{t.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
