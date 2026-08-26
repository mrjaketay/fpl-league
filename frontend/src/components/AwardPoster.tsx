type Props = {
  tone: 'green' | 'pink' | 'cyan';
  emoji: string;
  title: string;
  managerName: string;
  teamName: string;
  value: string;
  flyerImage?: string;
};

export default function AwardPoster({ tone, emoji, title, managerName, teamName, value, flyerImage }: Props) {
  if (flyerImage) {
    return (
      <div className={`poster poster--${tone}`} style={{ padding: 0, overflow: 'hidden' }}>
        <img src={flyerImage} alt={title} style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }} />
        <div style={{ padding: '1rem 1.25rem' }}>
          <div className="poster-title">{title}</div>
          <div className="poster-name">{managerName}</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{teamName}</div>
          <div className="poster-value">{value}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`poster poster--${tone}`}>
      <div className="poster-emoji">{emoji}</div>
      <div className="poster-title">{title}</div>
      <div className="poster-name">{managerName}</div>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{teamName}</div>
      <div className="poster-value">{value}</div>
    </div>
  );
}
