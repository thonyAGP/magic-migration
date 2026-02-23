import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionStatusBadge } from '../SessionStatusBadge';

describe('SessionStatusBadge', () => {
  it('should render closed status with correct label', () => {
    render(<SessionStatusBadge status="closed" />);

    expect(screen.getByText('Fermee')).toBeInTheDocument();
  });

  it('should render opening status with correct label', () => {
    render(<SessionStatusBadge status="opening" />);

    expect(screen.getByText('En ouverture')).toBeInTheDocument();
  });

  it('should render open status with correct label', () => {
    render(<SessionStatusBadge status="open" />);

    expect(screen.getByText('Ouverte')).toBeInTheDocument();
  });

  it('should render closing status with correct label', () => {
    render(<SessionStatusBadge status="closing" />);

    expect(screen.getByText('En fermeture')).toBeInTheDocument();
  });

  it('should apply gray classes for closed status', () => {
    render(<SessionStatusBadge status="closed" />);

    const badge = screen.getByText('Fermee');
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-600');
  });

  it('should apply blue classes for opening status', () => {
    render(<SessionStatusBadge status="opening" />);

    const badge = screen.getByText('En ouverture');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-600');
  });

  it('should apply green classes for open status', () => {
    render(<SessionStatusBadge status="open" />);

    const badge = screen.getByText('Ouverte');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-600');
  });

  it('should apply orange classes for closing status', () => {
    render(<SessionStatusBadge status="closing" />);

    const badge = screen.getByText('En fermeture');
    expect(badge.className).toContain('bg-orange-100');
    expect(badge.className).toContain('text-orange-600');
  });

  it('should use md size by default', () => {
    render(<SessionStatusBadge status="open" />);

    const badge = screen.getByText('Ouverte');
    expect(badge.className).toContain('px-2.5');
  });

  it('should use sm size when specified', () => {
    render(<SessionStatusBadge status="open" size="sm" />);

    const badge = screen.getByText('Ouverte');
    expect(badge.className).toContain('px-1.5');
  });
});
