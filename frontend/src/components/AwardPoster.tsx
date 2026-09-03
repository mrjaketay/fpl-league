type Props = {
  tone: 'green' | 'pink' | 'cyan';
  emoji: string;
  title: string;
  managerName: string;
  teamName: string;
  value: string;
  flyerImage?: string;
};

// Order swapped per your request: team name leads (bold, primary),
// manager's real name is secondary — matching how the official FPL app
// prioritizes team names over people's names.
export default function AwardPoster({ tone, emoji, title, managerName, teamName, value, flyerImage }: Props) {
  return (
    <div className={`poster poster--${tone}`}>
      {flyerImage ? (
        <div className="poster-image-wrap">
          <img src={flyerImage} alt={title} />
        </div>
      ) : (
        <div className="poster-emoji">{emoji}</div>
      )}
      <div className="poster-body">
        <div className="poster-title">{title}</div>
        <div className="poster-name">{teamName}</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{managerName}</div>
        <div className="poster-value">{value}</div>
      </div>
    </div>
  );
}
