// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnulationReferenceDialog } from '../AnnulationReferenceDialog';
import { GiftPassConfirmDialog } from '../GiftPassConfirmDialog';
import { ArticleTypeSelector } from '../ArticleTypeSelector';
import { safeTextSchema } from '../schemas-lot2';

describe('AnnulationReferenceDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onValidate: vi.fn(),
  };

  it('should render dialog when open', () => {
    render(<AnnulationReferenceDialog {...defaultProps} />);

    expect(screen.getByText('Annulation de transaction')).toBeDefined();
    expect(screen.getByPlaceholderText('Ex: TXN-2026-001')).toBeDefined();
  });

  it('should not render when closed', () => {
    render(<AnnulationReferenceDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Annulation de transaction')).toBeNull();
  });

  it('should disable search button when reference is empty', () => {
    render(<AnnulationReferenceDialog {...defaultProps} />);

    const searchButton = screen.getByText('Rechercher').closest('button');
    expect(searchButton?.disabled).toBe(true);
  });

  it('should display found transaction after search', async () => {
    render(<AnnulationReferenceDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Ex: TXN-2026-001');
    fireEvent.change(input, { target: { value: 'TXN-001' } });
    fireEvent.click(screen.getByText('Rechercher'));

    await waitFor(() => {
      expect(screen.getByText('Transaction trouvee')).toBeDefined();
      expect(screen.getByText('TXN-001')).toBeDefined();
      expect(screen.getByText('DUPONT Jean')).toBeDefined();
    });
  });

  it('should call onValidate when confirming annulation', async () => {
    const onValidate = vi.fn();
    render(<AnnulationReferenceDialog {...defaultProps} onValidate={onValidate} />);

    const input = screen.getByPlaceholderText('Ex: TXN-2026-001');
    fireEvent.change(input, { target: { value: 'TXN-001' } });
    fireEvent.click(screen.getByText('Rechercher'));

    await waitFor(() => {
      expect(screen.getByText('Annuler cette transaction')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Annuler cette transaction'));
    expect(onValidate).toHaveBeenCalledWith('TXN-001');
  });

  it('should call onClose when Fermer is clicked', () => {
    const onClose = vi.fn();
    render(<AnnulationReferenceDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('GiftPassConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
    balance: 350,
  };

  it('should render dialog when open', () => {
    render(<GiftPassConfirmDialog {...defaultProps} />);

    expect(screen.getByText('GiftPass - Action')).toBeDefined();
    expect(screen.getByText('Solde actuel')).toBeDefined();
  });

  it('should display formatted balance', () => {
    render(<GiftPassConfirmDialog {...defaultProps} balance={150.50} />);

    // Check that a balance amount is displayed (format depends on locale)
    const balanceEl = screen.getByText(/150/);
    expect(balanceEl).toBeDefined();
  });

  it('should not render when closed', () => {
    render(<GiftPassConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('GiftPass - Action')).toBeNull();
  });

  it('should call onSelect with V when Vente clicked', () => {
    const onSelect = vi.fn();
    render(<GiftPassConfirmDialog {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Vente (V)'));
    expect(onSelect).toHaveBeenCalledWith('V');
  });

  it('should call onSelect with C when Credit clicked', () => {
    const onSelect = vi.fn();
    render(<GiftPassConfirmDialog {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Credit (C)'));
    expect(onSelect).toHaveBeenCalledWith('C');
  });

  it('should call onSelect with D when Consulter clicked', () => {
    const onSelect = vi.fn();
    render(<GiftPassConfirmDialog {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Consulter solde (D)'));
    expect(onSelect).toHaveBeenCalledWith('D');
  });

  it('should call onClose when Fermer is clicked', () => {
    const onClose = vi.fn();
    render(<GiftPassConfirmDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('safeTextSchema', () => {
  it('should accept simple text', () => {
    const result = safeTextSchema.safeParse('Forfait ski');
    expect(result.success).toBe(true);
  });

  it('should accept text with accented characters', () => {
    const result = safeTextSchema.safeParse('Réservation été à Château');
    expect(result.success).toBe(true);
  });

  it('should accept text with allowed special characters', () => {
    const result = safeTextSchema.safeParse("Note: prix 50,00€ - ok!");
    expect(result.success).toBe(true);
  });

  it('should accept numbers', () => {
    const result = safeTextSchema.safeParse('Article 12345');
    expect(result.success).toBe(true);
  });

  it('should reject text with angle brackets', () => {
    const result = safeTextSchema.safeParse('<script>alert("xss")</script>');
    expect(result.success).toBe(false);
  });

  it('should reject text with backticks', () => {
    const result = safeTextSchema.safeParse('test `injection`');
    expect(result.success).toBe(false);
  });

  it('should reject text with curly braces', () => {
    const result = safeTextSchema.safeParse('test {injection}');
    expect(result.success).toBe(false);
  });

  it('should reject text with pipe', () => {
    const result = safeTextSchema.safeParse('test | rm -rf');
    expect(result.success).toBe(false);
  });

  it('should reject text with ampersand', () => {
    const result = safeTextSchema.safeParse('test & command');
    expect(result.success).toBe(false);
  });

  it('should reject empty string', () => {
    const result = safeTextSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('ArticleTypeSelector with ANN', () => {
  const defaultProps = {
    selected: 'default' as const,
    onSelect: vi.fn(),
    mode: 'GP' as const,
  };

  it('should render Annulation type in GP mode', () => {
    render(<ArticleTypeSelector {...defaultProps} />);

    expect(screen.getByText('Annulation')).toBeDefined();
  });

  it('should render Annulation type in Boutique mode', () => {
    render(<ArticleTypeSelector {...defaultProps} mode="Boutique" />);

    expect(screen.getByText('Annulation')).toBeDefined();
  });

  it('should call onSelect with ANN when clicked', () => {
    const onSelect = vi.fn();
    render(<ArticleTypeSelector {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Annulation'));
    expect(onSelect).toHaveBeenCalledWith('ANN');
  });

  it('should apply red styling when ANN is selected', () => {
    render(<ArticleTypeSelector {...defaultProps} selected="ANN" />);

    const annButton = screen.getByRole('radio', { checked: true });
    expect(annButton.className).toContain('red');
  });
});
