import { useStrategie } from './store';
import { typOf, titleOf } from './types';
import type { StrategieViewId } from './modules';

interface StChipProps {
  id: string;
  onOpen: (view: StrategieViewId) => void;
}

/** Bidirectional link pill — click navigates to the linked object's module. */
export function StChip({ id, onOpen }: StChipProps) {
  const { data } = useStrategie();
  const typ = typOf(id);
  const t = titleOf(data, id);
  const label = t.length > 34 ? `${t.slice(0, 33)}…` : t;
  return (
    <span
      className="st-chip"
      title={`${typ.label} · ${t}`}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(typ.view);
      }}
    >
      <span className="tc">{typ.label}</span>
      {label}
    </span>
  );
}
