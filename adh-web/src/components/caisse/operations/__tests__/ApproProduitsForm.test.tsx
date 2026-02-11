// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApproProduitsForm } from '../ApproProduitsForm';

describe('ApproProduitsForm', () => {
  it('should render with one empty line', () => {
    render(<ApproProduitsForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByText('Apport produits')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Libelle')).toBeInTheDocument();
    expect(screen.getByText('Ajouter un produit')).toBeInTheDocument();
  });

  it('should add a product line', () => {
    render(<ApproProduitsForm onSubmit={vi.fn()} isSubmitting={false} />);
    fireEvent.click(screen.getByText('Ajouter un produit'));
    const codeInputs = screen.getAllByPlaceholderText('Code');
    expect(codeInputs).toHaveLength(2);
  });

  it('should not submit with empty products', () => {
    const onSubmit = vi.fn();
    render(<ApproProduitsForm onSubmit={onSubmit} isSubmitting={false} />);
    fireEvent.click(screen.getByText('Valider'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should compute total correctly', () => {
    render(<ApproProduitsForm onSubmit={vi.fn()} isSubmitting={false} />);
    const codeInput = screen.getByPlaceholderText('Code');
    const libelleInput = screen.getByPlaceholderText('Libelle');
    const priceInput = screen.getByPlaceholderText('0.00');

    fireEvent.change(codeInput, { target: { value: 'P001' } });
    fireEvent.change(libelleInput, { target: { value: 'Produit test' } });
    fireEvent.change(priceInput, { target: { value: '25.50' } });

    expect(screen.getByText('25.50 EUR')).toBeInTheDocument();
  });

  it('should show submitting state', () => {
    render(<ApproProduitsForm onSubmit={vi.fn()} isSubmitting={true} />);
    expect(screen.getByText('Validation...')).toBeInTheDocument();
  });
});
