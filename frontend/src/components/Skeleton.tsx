// Small reusable shimmer block for loading states — sized/shaped per
// call site to roughly match the content it's standing in for, so the
// page doesn't jump around once the real data arrives.
export default function Skeleton({
  width = '100%',
  height = 14,
  style = {},
}: {
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}
