import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataSourceToggle } from '../DataSourceToggle';

const mockToggle = vi.fn();
let mockIsRealApi = false;

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: vi.fn(() => ({
    isRealApi: mockIsRealApi,
    toggle: mockToggle,
  })),
}));

describe('DataSourceToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsRealApi = false;
    const { useDataSourceStore } = vi.mocked(
      await import('@/stores/dataSourceStore')
    );
    useDataSourceStore.mockReturnValue({
      isRealApi: false,
      toggle: mockToggle,
      setRealApi: vi.fn(),
    });
  });

  it('should render Mock label when isRealApi is false', () => {
    render(<DataSourceToggle />);
    expect(screen.getByText('Mock')).toBeInTheDocument();
  });

  it('should render API label when isRealApi is true', async () => {
    const { useDataSourceStore } = vi.mocked(
      await import('@/stores/dataSourceStore')
    );
    useDataSourceStore.mockReturnValue({
      isRealApi: true,
      toggle: mockToggle,
      setRealApi: vi.fn(),
    });
    render(<DataSourceToggle />);
    expect(screen.getByText('API')).toBeInTheDocument();
  });

  it('should call toggle on click', () => {
    render(<DataSourceToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockToggle).toHaveBeenCalledOnce();
  });

  it('should have amber styling in mock mode', () => {
    render(<DataSourceToggle />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('amber');
  });

  it('should have green styling in API mode', async () => {
    const { useDataSourceStore } = vi.mocked(
      await import('@/stores/dataSourceStore')
    );
    useDataSourceStore.mockReturnValue({
      isRealApi: true,
      toggle: mockToggle,
      setRealApi: vi.fn(),
    });
    render(<DataSourceToggle />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('green');
  });
});
