import './Avatar.scss';

interface Props {
  size?: number;
  color?: string;
  color2?: string;
}

export function Avatar({ size = 28, color = '#3d8cff', color2 = '#8c3dff' }: Props) {
  return (
    <div
      className="da-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: `linear-gradient(135deg, ${color}, ${color2})`,
      }}
    />
  );
}
