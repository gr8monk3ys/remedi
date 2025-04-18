interface BulletListProps {
  items: string[] | undefined;
  emptyMessage?: string;
}

/**
 * Bullet list component for benefits, side effects, etc.
 */
export function BulletList({
  items,
  emptyMessage = "No information available",
}: BulletListProps): React.ReactElement {
  if (!items || items.length === 0) {
    return (
      <span className="text-sm text-muted-foreground italic">
        {emptyMessage}
      </span>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li
          key={index}
          className="text-sm text-foreground flex items-start gap-2"
        >
          <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
