// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VRLIdentityDialog } from '../VRLIdentityDialog';

describe('VRLIdentityDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onValidate: vi.fn(),
  };

  it('should render dialog title', () => {
    render(<VRLIdentityDialog {...defaultProps} />);

    expect(screen.getByText('Identite VRL')).toBeDefined();
  });

  it('should have nom, prenom, document type, and number fields', () => {
    render(<VRLIdentityDialog {...defaultProps} />);

    expect(screen.getByPlaceholderText('Nom')).toBeDefined();
    expect(screen.getByPlaceholderText('Prenom')).toBeDefined();
    expect(screen.getByPlaceholderText('Numero')).toBeDefined();
    expect(screen.getByDisplayValue('Choisir...')).toBeDefined();
  });

  it('should disable validate button when fields are empty', () => {
    render(<VRLIdentityDialog {...defaultProps} />);

    const button = screen.getByText('Valider identite').closest('button');
    expect(button?.disabled).toBe(true);
  });

  it('should call onValidate with identity data when submitted', () => {
    const onValidate = vi.fn();
    render(<VRLIdentityDialog {...defaultProps} onValidate={onValidate} />);

    fireEvent.change(screen.getByPlaceholderText('Nom'), {
      target: { value: 'Dupont' },
    });
    fireEvent.change(screen.getByPlaceholderText('Prenom'), {
      target: { value: 'Jean' },
    });
    fireEvent.change(screen.getByDisplayValue('Choisir...'), {
      target: { value: 'CNI' },
    });
    fireEvent.change(screen.getByPlaceholderText('Numero'), {
      target: { value: 'ABC123' },
    });

    fireEvent.click(screen.getByText('Valider identite'));

    expect(onValidate).toHaveBeenCalledWith({
      nom: 'Dupont',
      prenom: 'Jean',
      typeDocument: 'CNI',
      numeroDocument: 'ABC123',
    });
  });

  it('should pre-fill with initial data', () => {
    render(
      <VRLIdentityDialog
        {...defaultProps}
        initialData={{
          nom: 'Martin',
          prenom: 'Sophie',
          typeDocument: 'PASSPORT',
          numeroDocument: 'XYZ789',
        }}
      />,
    );

    expect(screen.getByDisplayValue('Martin')).toBeDefined();
    expect(screen.getByDisplayValue('Sophie')).toBeDefined();
    expect(screen.getByDisplayValue('XYZ789')).toBeDefined();
  });

  it('should not render when closed', () => {
    render(<VRLIdentityDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Identite VRL')).toBeNull();
  });
});
