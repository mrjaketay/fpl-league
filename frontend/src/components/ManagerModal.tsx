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
        defaultGw={manager.last_gameweek ?? defaultGw}
        onClose={() => setViewingTeam(false)}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <span className="field-label">Manager</span>
        <h2 style={{ fontSize: '1.3rem', marginTop: '0.3rem' }}>{manager.manager_name}</h2>
        <span style={{ color: 'var(--grey)' }}>{manager.team_name}</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
          {manager.total_points_after != null && (
            <div className="stat-tile">
              <span className="label">Season Points</span>
              <span className="value">{manager.total_points_after}</span>
            </div>
          )}
          {manager.overall_rank != null && (
            <div className="stat-tile">
              <span className="label">Global Rank</span>
              <span className="value" style={{ fontSize: '1.1rem' }}>{manager.overall_rank.toLocaleString()}</span>
            </div>
          )}
          {manager.motw_wins != null && (
            <div className="stat-tile">
              <span className="label">🏆 Manager of the Week</span>
              <span className="value">{manager.motw_wins}</span>
            </div>
          )}
          {manager.dotw_wins != null && (
            <div className="stat-tile">
              <span className="label">🐴 Donkey of the Week</span>
              <span className="value">{manager.dotw_wins}</span>
            </div>
          )}
        </div>

        <button className="btn btn--primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setViewingTeam(true)}>
          View Team
        </button>
      </div>
    </div>
  );
}
