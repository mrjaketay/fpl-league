import AwardIcon from './AwardIcon';

type Winner = { managerName: string; teamName: string };
type IconKind = 'motw' | 'dotw' | 'defense' | 'midfield' | 'attack' | 'hof';

type Props = {
  tone: 'green' | 'pink' | 'cyan';
  icon: IconKind;
  title: string;
  winners: Winner[];
  value: string;
  flyerImage?: string;
  iconSize?: number;
};

// Team name leads (bold, primary), manager's real name is secondary —
// matching how the official FPL app prioritizes team names over people's
// names. Handles 1 or several joint winners with a proper stacked list
// instead of a single cramped "&"-joined line.
export default function AwardPoster({ tone, icon, title, winners, value, flyerImage, iconSize = 44 }: Props) {
  const isJoint = winners.length > 1;

  return (
    <div className={`poster poster--${tone}`}>
      {flyerImage ? (
        <div className="poster-image-wrap">
          <img src={flyerImage} alt={title} />
        </div>
      ) : (
        <AwardIcon kind={icon} size={iconSize} />
      )}
      <div className="poster-body">
        <div className="poster-title">{isJoint ? `Joint ${title}` : title}</div>
        <div className="poster-winners">
          {winners.map((w, i) => (
            <div className="poster-winner-row" key={i}>
              <span className="pw-team">{w.teamName}</span>
              <span className="pw-manager">{w.managerName}</span>
            </div>
          ))}
        </div>
        <div className="poster-value">{value}</div>
      </div>
    </div>
  );
}
