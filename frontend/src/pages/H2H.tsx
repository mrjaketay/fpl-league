import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';
import AiFlyerModal from '../components/AiFlyerModal';

export default function H2H() {
  const [gw, setGw] = useState(1);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [table, setTable] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showAiFlyer, setShowAiFlyer] = useState(false);
  const fixturesCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.h2hGameweek(gw).then(setFixtures).catch(() => setFixtures([]));
  }, [gw]);

  useEffect(() => {
    api.h2hTable().then(setTable).catch(() => {});
  }, []);

  // Screenshots the fixtures card and downloads it as a PNG — good for
  // sharing the week's fixtures to a WhatsApp group as a ready-made flyer,
  // no extra design tool needed.
  //
  // The fixture rows normally fade in one after another with a staggered
  // delay. html2canvas doesn't process CSS animations properly — it was
  // capturing most rows still in their "not yet appeared" (invisible)
  // state, which is why only the first fixture ever showed up in the
  // downloaded image. Fix: switch to a static (non-animated) class just
  // for the capture, wait a couple of frames for React to actually
  // re-render with that change, then screenshot.
  async function downloadFixturesFlyer() {
    if (!fixturesCardRef.current) return;
    setDownloading(true);
    setCapturing(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(fixturesCardRef.current, {
        backgroundColor: '#1c0021',
        scale: 2,
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `h2h-fixtures-gw${gw}.png`;
      a.click();
    } finally {
      setCapturing(false);
      setDownloading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in" ref={fixturesCardRef}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="field-label">Gameweek</span>
            <GameweekSelect value={gw} onChange={setGw} />
          </div>
          {fixtures.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn--ghost" disabled={downloading} onClick={downloadFixturesFlyer}>
                {downloading ? 'Preparing…' : '⬇ Download as image'}
              </button>
              <button className="btn btn--primary" onClick={() => setShowAiFlyer(true)}>
                ✨ AI Flyer
              </button>
            </div>
          )}
        </div>
        {fixtures.length === 0 && (
          <p style={{ color: 'var(--grey)' }}>No fixtures yet — generate them once from Admin.</p>
        )}
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {fixtures.map((f, i) => {
            const w1 = f.winner_name === f.manager_1_name;
            const w2 = f.winner_name === f.manager_2_name;
            return (
              <div key={f.id} className={capturing ? '' : 'row-in'} style={{ animationDelay: `${i * 0.05}s`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '0.75rem 1rem' }}>
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

      {showAiFlyer && <AiFlyerModal gw={gw} fixtures={fixtures} onClose={() => setShowAiFlyer(false)} />}
    </div>
  );
}
