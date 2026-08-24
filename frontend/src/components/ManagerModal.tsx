type Manager = {
  entry_id: number;
  manager_name: string;
  team_name: string;
  total_points_after?: number;
  overall_rank?: number;
  weeks_in_1st?: number;
  motw_wins?: number;
  dotw_wins?: number;
};

export default function ManagerModal({ manager, onClose }: { manager: Manager; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
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

        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem' }}>
          <a
            className="btn btn--primary"
            style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}
            href={`https://fantasy.premierleague.com/entry/${manager.entry_id}/history`}
            target="_blank"
            rel="noreferrer"
          >
            View Team
          </a>
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
