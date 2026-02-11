// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmailSendDialog } from '../EmailSendDialog';

// Mock dataSourceStore
vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: () => ({ isRealApi: false }),
  },
}));

describe('EmailSendDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="facture"
        documentId="123"
      />,
    );

    expect(screen.getByText('Envoyer par email')).toBeInTheDocument();
    expect(screen.getByText('Destinataire')).toBeInTheDocument();
    expect(screen.getByText('Sujet')).toBeInTheDocument();
    expect(screen.getByText('Message (optionnel)')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <EmailSendDialog
        open={false}
        onClose={vi.fn()}
        documentType="facture"
        documentId="123"
      />,
    );

    expect(screen.queryByText('Envoyer par email')).not.toBeInTheDocument();
  });

  it('should pre-fill email when defaultEmail provided', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="facture"
        documentId="123"
        defaultEmail="test@example.com"
      />,
    );

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('should disable send button when email is empty', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="facture"
        documentId="123"
      />,
    );

    const sendButton = screen.getByText('Envoyer');
    expect(sendButton.closest('button')).toBeDisabled();
  });

  it('should enable send button with valid email', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="facture"
        documentId="123"
        defaultEmail="valid@email.com"
      />,
    );

    const sendButton = screen.getByText('Envoyer');
    expect(sendButton.closest('button')).not.toBeDisabled();
  });

  it('should auto-generate subject based on document type', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="extrait"
        documentId="456"
      />,
    );

    const subjectInput = screen.getByDisplayValue(/Extrait de compte/);
    expect(subjectInput).toBeInTheDocument();
  });

  it('should show different label for garantie document type', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="garantie"
        documentId="789"
      />,
    );

    expect(screen.getByText(/Garantie/)).toBeInTheDocument();
  });

  it('should allow typing in message textarea', () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={vi.fn()}
        documentType="facture"
        documentId="123"
      />,
    );

    const textarea = screen.getByPlaceholderText('Ajoutez un message...');
    fireEvent.change(textarea, { target: { value: 'Mon message' } });
    expect(textarea).toHaveValue('Mon message');
  });
});
