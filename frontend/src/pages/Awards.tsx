import { useEffect, useState } from 'react';
import { api } from '../api/client';

const LABELS: Record<string, { label: string; tone: 'green' | 'pink' | 'cyan' | 'outline'; emoji: string }> = {
  manager_of_week: { label: 'Manager of the Week', tone: 'green', emoji: '🏆' },
  donkey_of_week: { label: 'Donkey of the Week', tone: 'pink', emoji: '🐴' },
  hall_of_fame: { label: 'Hall of Fame (100+, no chip)', tone: 'cyan', emoji: '⭐' },
  captains_curse: { label: "Captain's Curse", tone: 'pink', emoji: '💀' },
  bench_bandit: { label: 'Bench Bandit', tone: 'outline', emoji: '🪑' },
  transfer_villain: { label: 'Transfer Villain', tone: 'pink', emoji: '🔻' },
  the_wall: { label: 'The Wall (best defense)', tone: 'green', emoji: '🧱' },
  the_sieve: { label: 'The Sieve (worst defense)', tone: 'pink', emoji: '🕳️' },
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
    setError(null);
    api.gameweekAwards(gw).then(setAwards).catch((e) => setError(e.message));
  }, [gw]);

  useEffect(() => {
    api.seasonTally().then(setTally).catch(() => {});
  }, []);

  const motw = awards.find((a) => a.award_type === 'manager_of_week');
  const dotw = awards.find((a) => a.award_type === 'donkey_of_week');
  const rest = awards.filter((a) => a.award_type !== 'manager_of_week' && a.award_type !== 'donkey_of_week');

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="mono" style={{ color: 'var(--grey)', fontSize: '0.8rem' }}>GAMEWEEK</span>
        <input type="number" min={1} max={38} value={gw} onChange={(e) => setGw(Number(e.target.value))} style={{ width: 64 }} />
      </div>

      {error && <p className="pill pill--pink">{error}</p>}
      {awards.length === 0 && !error && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--grey)', padding: '2rem' }}>
          No awards computed for GW{gw} yet.
        </div>
      )}

      {(motw || dotw) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {motw && (
            <div className="card card--hero">
              <span className="pill pill--green">🏆 Manager of the Week</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.6rem' }}>{motw.manager_name}</h3>
              <span style={{ color: 'var(--grey)' }}>{motw.team_name}</span>
              <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--green)', marginTop: '0.5rem' }}>{motw.value} pts</div>
            </div>
          )}
          {dotw && (
            <div className="card" style={{ border: '1px solid rgba(255,40,130,0.3)' }}>
              <span className="pill pill--pink">🐴 Donkey of the Week</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.6rem' }}>{dotw.manager_name}</h3>
              <span style={{ color: 'var(--grey)' }}>{dotw.team_name}</span>
              <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--pink)', marginTop: '0.5rem' }}>
                {dotw.value} pts
                {dotw.details?.raw_points != null && (
                  <span style={{ fontSize: '0.9rem', color: 'var(--grey)' }}> ({dotw.details.raw_points} before hit)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>OTHER AWARDS THIS WEEK</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {rest.map((a) => {
              const meta = LABELS[a.award_type] ?? { label: a.award_type, tone: 'outline' as const, emoji: '🎖️' };
              return (
                <div key={`${a.award_type}-${a.entry_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{meta.emoji}</span>
                    <div>
                      <span className={`pill pill--${meta.tone}`}>{meta.label}</span>
                      <div style={{ marginTop: '0.3rem' }}>{a.manager_name} <span style={{ color: 'var(--grey)' }}>({a.team_name})</span></div>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: '1.1rem' }}>{a.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>TROPHY CABINET</h3>
        {tally.length === 0 ? (
          <p style={{ color: 'var(--grey)' }}>No awards handed out yet this season.</p>
        ) : (
          <table>
            <thead><tr><th>Manager</th><th>Award</th><th>Wins</th></tr></thead>
            <tbody>
              {tally.map((t, i) => (
                <tr key={i}>
                  <td>{t.manager_name}</td>
                  <td style={{ color: 'var(--grey)' }}>{LABELS[t.award_type]?.label ?? t.award_type}</td>
                  <td className="num">{t.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
