// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CounterOccupation } from '../CounterOccupation';

describe('CounterOccupation', () => {
  it('should render current and max count', () => {
    render(<CounterOccupation currentCount={5} maxCapacity={20} />);

    expect(screen.getByText('5 / 20')).toBeDefined();
  });

  it('should show green color when under 70%', () => {
    const { container } = render(
      <CounterOccupation currentCount={10} maxCapacity={20} />,
    );

    const text = screen.getByText('10 / 20');
    expect(text.className).toContain('text-success');

    const bar = container.querySelector('.bg-success.rounded-full');
    expect(bar).toBeDefined();
  });

  it('should show warning color between 70-90%', () => {
    const { container } = render(
      <CounterOccupation currentCount={16} maxCapacity={20} />,
    );

    const text = screen.getByText('16 / 20');
    expect(text.className).toContain('text-warning');

    const bar = container.querySelector('.bg-warning.rounded-full');
    expect(bar).toBeDefined();
  });

  it('should show danger color above 90%', () => {
    const { container } = render(
      <CounterOccupation currentCount={19} maxCapacity={20} />,
    );

    const text = screen.getByText('19 / 20');
    expect(text.className).toContain('text-danger');

    const bar = container.querySelector('.bg-danger.rounded-full');
    expect(bar).toBeDefined();
  });

  it('should not show waiting badge when waitingCount is 0', () => {
    render(<CounterOccupation currentCount={5} maxCapacity={20} waitingCount={0} />);

    expect(screen.queryByText(/en attente/)).toBeNull();
  });

  it('should show waiting badge when waitingCount > 0', () => {
    render(<CounterOccupation currentCount={5} maxCapacity={20} waitingCount={3} />);

    expect(screen.getByText('3 en attente')).toBeDefined();
  });

  it('should cap progress bar at 100%', () => {
    const { container } = render(
      <CounterOccupation currentCount={25} maxCapacity={20} />,
    );

    const bar = container.querySelector('[style*="width"]');
    expect(bar?.getAttribute('style')).toContain('100%');
  });

  it('should handle zero max capacity gracefully', () => {
    render(<CounterOccupation currentCount={0} maxCapacity={0} />);

    expect(screen.getByText('0 / 0')).toBeDefined();
  });
});
