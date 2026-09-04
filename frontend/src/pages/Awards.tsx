import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';

const LABELS: Record<string, { label: string; tone: 'green' | 'pink' | 'cyan' | 'outline'; emoji: string }> = {
  manager_of_week: { label: 'Manager of the Week', tone: 'green', emoji: '🏆' },
  donkey_of_week: { label: 'Donkey of the Week', tone: 'pink', emoji: '🐴' },
  hall_of_fame: { label: 'Hall of Fame (100+, no chip)', tone: 'cyan', emoji: '⭐' },
  captains_curse: { label: "Captain's Curse", tone: 'pink', emoji: '💀' },
  bench_bandit: { label: 'Bench Bandit', tone: 'outline', emoji: '🪑' },
  transfer_villain: { label: 'Transfer Villain', tone: 'pink', emoji: '🔻' },
  the_wall: { label: 'The Wall (best defense)', tone: 'green', emoji: '🧱' },
  the_sieve: { label: 'The Sieve (worst defense)', tone: 'pink', emoji: '🕳️' },
  midfield_king: { label: 'Midfield King (best midfield)', tone: 'green', emoji: '🎯' },
  midfield_flop: { label: 'Midfield Flop (worst midfield)', tone: 'pink', emoji: '🎯' },
  attack_king: { label: 'Attack King (best attack)', tone: 'green', emoji: '⚡' },
  attack_flop: { label: 'Attack Flop (worst attack)', tone: 'pink', emoji: '⚡' },
};

type Award = {
  award_type: string;
  entry_id: number;
  manager_name: string;
  team_name: string;
  value: number;
  details: any;
};

function namesList(list: Award[]) {
  return list.map((a) => a.team_name).join(' & ');
}

export default function Awards() {
  const [gw, setGw] = useState(1);
  const [awards, setAwards] = useState<Award[]>([]);
  const [tally, setTally] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trophyFilter, setTrophyFilter] = useState('leaders');

  useEffect(() => {
    setError(null);
    api.gameweekAwards(gw).then(setAwards).catch((e) => setError(e.message));
  }, [gw]);

  useEffect(() => {
    api.seasonTally().then(setTally).catch(() => {});
  }, []);

  const motwList = awards.filter((a) => a.award_type === 'manager_of_week');
  const dotwList = awards.filter((a) => a.award_type === 'donkey_of_week');
  const restTypes = Array.from(new Set(
    awards.filter((a) => a.award_type !== 'manager_of_week' && a.award_type !== 'donkey_of_week').map((a) => a.award_type)
  ));
  const trophyTypes = Array.from(new Set(tally.map((t) => t.award_type)));

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="field-label">Gameweek</span>
          <GameweekSelect value={gw} onChange={setGw} />
        </div>
      </div>

      {error && <p className="pill pill--pink">{error}</p>}
      {awards.length === 0 && !error && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--grey)', padding: '2rem' }}>
          No awards computed for GW{gw} yet.
        </div>
      )}

      {(motwList.length > 0 || dotwList.length > 0) && (
        <div className="two-col-even">
          {motwList.length > 0 && (
            <div className="card card--hero fade-in fade-in-1" style={{ height: '100%' }}>
              <span className="pill pill--green">🏆 {motwList.length > 1 ? 'Joint Manager of the Week' : 'Manager of the Week'}</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.6rem' }}>{namesList(motwList)}</h3>
              <span style={{ color: 'var(--grey)' }}>{motwList.map((a) => a.manager_name).join(' & ')}</span>
              <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--green)', marginTop: '0.5rem' }}>{motwList[0].value} pts</div>
            </div>
          )}
          {dotwList.length > 0 && (
            <div className="card fade-in fade-in-2" style={{ border: '1px solid rgba(255,40,130,0.3)', height: '100%' }}>
              <span className="pill pill--pink">🐴 {dotwList.length > 1 ? 'Joint Donkey of the Week' : 'Donkey of the Week'}</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.6rem' }}>{namesList(dotwList)}</h3>
              <span style={{ color: 'var(--grey)' }}>{dotwList.map((a) => a.manager_name).join(' & ')}</span>
              <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--pink)', marginTop: '0.5rem' }}>{dotwList[0].value} pts</div>
            </div>
          )}
        </div>
      )}

      {restTypes.length > 0 && (
        <div className="card fade-in fade-in-3">
          <div className="section-heading">OTHER AWARDS THIS WEEK</div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {restTypes.map((type, i) => {
              const winners = awards.filter((a) => a.award_type === type);
              const meta = LABELS[type] ?? { label: type, tone: 'outline' as const, emoji: '🎖️' };
              return (
                <div key={type} className="row-in" style={{ animationDelay: `${i * 0.05}s`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{meta.emoji}</span>
                    <div>
                      <span className={`pill pill--${meta.tone}`}>{winners.length > 1 ? `Joint ${meta.label}` : meta.label}</span>
                      <div style={{ marginTop: '0.3rem' }}>
                        {winners.map((w) => w.team_name).join(' & ')}
                        <span style={{ color: 'var(--grey)' }}> ({winners.map((w) => w.manager_name).join(' & ')})</span>
                      </div>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: '1.1rem' }}>{winners[0].value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="section-heading" style={{ marginBottom: 0 }}>TROPHY CABINET</div>
          <select className="gw-select" value={trophyFilter} onChange={(e) => setTrophyFilter(e.target.value)}>
            <option value="leaders">Leaderboard (top per award)</option>
            {trophyTypes.map((t) => (
              <option key={t} value={t}>{LABELS[t]?.label ?? t}</option>
            ))}
          </select>
        </div>

        {tally.length === 0 ? (
          <p style={{ color: 'var(--grey)' }}>No awards handed out yet this season.</p>
        ) : trophyFilter === 'leaders' ? (
          <div className="three-col">
            {trophyTypes.map((type, i) => {
              const rowsForType = tally.filter((t) => t.award_type === type).sort((a, b) => b.wins - a.wins);
              const topWins = rowsForType[0]?.wins;
              const leaders = rowsForType.filter((r) => r.wins === topWins);
              const meta = LABELS[type] ?? { label: type, emoji: '🎖️' };
              return (
                <div key={type} className="stat-tile row-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="label">{meta.emoji} {meta.label}</span>
                  <span className="value" style={{ fontSize: '1.05rem' }}>{leaders.map((l) => l.team_name).join(' & ')}</span>
                  <span className="mono" style={{ color: 'var(--green)', fontSize: '0.85rem' }}>{topWins} win{topWins !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="table-scroll"><table>
            <thead><tr><th>Team</th><th>Wins</th></tr></thead>
            <tbody>
              {tally.filter((t) => t.award_type === trophyFilter).sort((a, b) => b.wins - a.wins).map((t, i) => (
                <tr key={i}>
                  <td>{t.team_name}</td>
                  <td className="num">{t.wins}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
