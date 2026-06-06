export function HomeBizilinkBrand({
  onPointerEnter,
}: {
  onPointerEnter?: () => void;
}) {
  return (
    <span
      className="home-bizilink-brand text-bakery-primary"
      onMouseEnter={onPointerEnter}
      onFocus={onPointerEnter}
      tabIndex={0}
      role="img"
      aria-label="BiziLink"
    >
      BiziLink
    </span>
  );
}
