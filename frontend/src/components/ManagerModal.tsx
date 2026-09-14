import { useState } from 'react';
import TeamModal from './TeamModal';

type Manager = {
  entry_id: number;
  manager_name: string;
  team_name: string;
  total_points_after?: number;
  overall_rank?: number;
  weeks_in_1st?: number;
  motw_wins?: number;
  dotw_wins?: number;
  last_gameweek?: number;
};

export default function ManagerModal({ manager, onClose, defaultGw = 1 }: { manager: Manager; onClose: () => void; defaultGw?: number }) {
  const [viewingTeam, setViewingTeam] = useState(false);

  if (viewingTeam) {
    return (
      <TeamModal
        entryId={manager.entry_id}
        managerName={manager.manager_name}
        teamName={manager.team_name}
        defaultGw={manager.last_gameweek ?? defaultGw}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <span className="field-label">Team</span>
        <h2 style={{ fontSize: '1.3rem', marginTop: '0.3rem' }}>{manager.team_name}</h2>
        <span style={{ color: 'var(--grey)' }}>{manager.manager_name}</span>

        {/* Season Points leads as the hero stat — the one number that
            matters most — rather than sitting in a uniform grid with
            everything else at equal visual weight. */}
        {manager.total_points_after != null && (
          <div className="card card--hero" style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', textAlign: 'center' }}>
            <span className="field-label">Season Points</span>
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green)', marginTop: '0.2rem' }}>
              {manager.total_points_after}
            </div>
            {manager.overall_rank != null && (
              <span style={{ color: 'var(--grey)', fontSize: '0.8rem' }}>Global Rank: {manager.overall_rank.toLocaleString()}</span>
            )}
          </div>
        )}

        {/* MOTW / DOTW as smaller badge-style stats underneath, since
            they're secondary context, not the headline number. */}
        {(manager.motw_wins != null || manager.dotw_wins != null) && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            {manager.motw_wins != null && (
              <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,255,133,0.08)', borderRadius: 8, padding: '0.6rem' }}>
                <div style={{ fontSize: '1.3rem' }}>🏆</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{manager.motw_wins}</div>
                <div style={{ color: 'var(--grey)', fontSize: '0.7rem' }}>Manager of the Week</div>
              </div>
            )}
            {manager.dotw_wins != null && (
              <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,40,130,0.08)', borderRadius: 8, padding: '0.6rem' }}>
                <div style={{ fontSize: '1.3rem' }}>🫏</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{manager.dotw_wins}</div>
                <div style={{ color: 'var(--grey)', fontSize: '0.7rem' }}>Donkey of the Week</div>
              </div>
            )}
          </div>
        )}

        <button className="btn btn--primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setViewingTeam(true)}>
          View Team
        </button>
      </div>
    </div>
  );
}
