import type { FC } from 'react';
import { useSessionTimestampStore } from '@/stores/sessionTimestampStore';

export interface HiddenPanelProps {
  className?: string;
}

export const HiddenPanel: FC<HiddenPanelProps> = ({ className }) => {
  const timestamp = useSessionTimestampStore((s) => s.timestamp);

  return (
    <div className={className}>
      <input
        type="hidden"
        id="timestamp-provider"
        name="timestamp"
        value={timestamp}
      />
    </div>
  );
};