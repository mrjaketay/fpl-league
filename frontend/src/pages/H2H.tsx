import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';

export default function H2H() {
  const [gw, setGw] = useState(1);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [table, setTable] = useState<any[]>([]);

  useEffect(() => {
    api.h2hGameweek(gw).then(setFixtures).catch(() => setFixtures([]));
  }, [gw]);

  useEffect(() => {
    api.h2hTable().then(setTable).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span className="field-label">Gameweek</span>
          <GameweekSelect value={gw} onChange={setGw} />
        </div>
        {fixtures.length === 0 && (
          <p style={{ color: 'var(--grey)' }}>No fixtures yet — generate them once from Admin.</p>
        )}
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {fixtures.map((f, i) => {
            const w1 = f.winner_name === f.manager_1_name;
            const w2 = f.winner_name === f.manager_2_name;
            return (
              <div key={f.id} className="row-in" style={{ animationDelay: `${i * 0.05}s`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <span style={{ fontWeight: w1 ? 700 : 400, color: w1 ? 'var(--green)' : 'var(--white)', flex: 1 }}>{f.team_1_name}</span>
                <span className="pill pill--outline">VS</span>
                <span style={{ fontWeight: w2 ? 700 : 400, color: w2 ? 'var(--green)' : 'var(--white)', flex: 1, textAlign: 'right' }}>{f.team_2_name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-in fade-in-1">
        <div className="section-heading" data-tip="Standard 3 points for a win, 1 for a draw, sorted by League Points then Diff">
          SEASON H2H LEAGUE TABLE
        </div>
        <div className="table-scroll"><table>
          <thead>
            <tr>
              <th>Team</th>
              <th title="Played">P</th>
              <th title="Won">W</th>
              <th title="Drawn">D</th>
              <th title="Lost">L</th>
              <th title="Points scored, for">PF</th>
              <th title="Points scored, against">PA</th>
              <th title="Points difference (PF - PA)">Diff</th>
              <th title="League points: 3 for a win, 1 for a draw">Pts</th>
            </tr>
          </thead>
          <tbody>
            {table.map((t, i) => (
              <tr key={t.entry_id} className="row-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <td style={{ fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--green)' : 'var(--white)' }}>{t.team_name}</td>
                <td className="num">{t.played}</td>
                <td className="num">{t.won}</td>
                <td className="num">{t.drawn}</td>
                <td className="num">{t.lost}</td>
                <td className="num">{t.points_for}</td>
                <td className="num">{t.points_against}</td>
                <td className="num" style={{ color: Number(t.diff) > 0 ? 'var(--green)' : Number(t.diff) < 0 ? 'var(--pink)' : 'var(--grey)' }}>
                  {Number(t.diff) > 0 ? '+' : ''}{t.diff}
                </td>
                <td className="num" style={{ fontWeight: 700 }}>{t.league_points}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
